from __future__ import annotations

import math
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.product import Product, ProductVariant
from app.schemas.admin import (
    AdminProductCreateSchema,
    AdminProductUpdateSchema,
    AdminVariantCreateSchema,
    AdminVariantUpdateSchema,
    PaginatedAdminProductsSchema,
    TryOnConfigSchema,
    TryOnConfigUpdateSchema,
)
from app.schemas.auth import UserClaims
from app.schemas.mappers import product_to_schema, try_on_config_to_schema, variant_to_schema
from app.schemas.product import ProductSchema, ProductVariantSchema

router = APIRouter(prefix="/admin/products", tags=["admin-products"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


@router.get("", response_model=PaginatedAdminProductsSchema)
async def list_admin_products(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, alias="q"),
    status_filter: str | None = Query(None, alias="status"),
) -> PaginatedAdminProductsSchema:
    base = select(Product).options(
        selectinload(Product.variants),
        selectinload(Product.category),
    )
    if search:
        pattern = f"%{search}%"
        base = base.where(Product.name.ilike(pattern) | Product.slug.ilike(pattern))
    if status_filter:
        base = base.where(Product.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
    offset = (page - 1) * page_size
    result = await db.execute(base.order_by(Product.name).offset(offset).limit(page_size))
    products = result.scalars().unique().all()
    pages = max(1, math.ceil(total / page_size)) if total else 1

    return PaginatedAdminProductsSchema(
        items=[product_to_schema(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.post("", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: AdminProductCreateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> ProductSchema:
    existing = await db.execute(select(Product).where(Product.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    product = Product(
        id=_new_id("prod"),
        slug=body.slug,
        name=body.name,
        description=body.description,
        short_description=body.shortDescription,
        category_id=body.categoryId,
        primary_material=body.primaryMaterial,
        min_price=body.minPrice,
        materials=body.materials,
        care_instructions=body.careInstructions,
        featured=body.featured,
        occasion=body.occasion,
        related_slugs=body.relatedSlugs,
        images=body.images,
        tags=body.tags,
        ai_generated_tags=body.aiGeneratedTags,
        status=body.status,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(product)
    await db.commit()
    await db.refresh(product, ["variants", "category"])
    return product_to_schema(product)


@router.post("/analyze-image")
async def analyze_product_image(
    db: DbSession,
    admin: AdminUser,
    file: UploadFile = File(...),
) -> dict:
    from app.services.ai.vision import analyze_product_image as run_analyze

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    mime = file.content_type or "image/jpeg"
    return await run_analyze(db, image_bytes=content, mime_type=mime, user_id=admin.sub)


@router.get("/{product_id}", response_model=ProductSchema)
async def get_admin_product(product_id: str, db: DbSession, _admin: AdminUser) -> ProductSchema:
    product = await _get_product(db, product_id)
    return product_to_schema(product)


@router.get("/{product_id}/try-on", response_model=TryOnConfigSchema)
async def get_try_on_config(
    product_id: str, db: DbSession, _admin: AdminUser
) -> TryOnConfigSchema:
    product = await _get_product(db, product_id)
    return try_on_config_to_schema(product)


@router.put("/{product_id}/try-on", response_model=TryOnConfigSchema)
async def update_try_on_config(
    product_id: str,
    body: TryOnConfigUpdateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> TryOnConfigSchema:
    product = await _get_product(db, product_id)
    updates = body.model_dump(exclude_unset=True)
    field_map = {
        "tryOnEnabled": "try_on_enabled",
        "tryOnType": "try_on_type",
        "tryOnAssetUrl": "try_on_asset_url",
        "tryOnScale": "try_on_scale",
        "tryOnLeftOffsetX": "try_on_left_offset_x",
        "tryOnLeftOffsetY": "try_on_left_offset_y",
        "tryOnRightOffsetX": "try_on_right_offset_x",
        "tryOnRightOffsetY": "try_on_right_offset_y",
        "tryOnRotation": "try_on_rotation",
        "tryOnVerticalOffset": "try_on_vertical_offset",
        "tryOnNecklaceAssetUrl": "try_on_necklace_asset_url",
        "tryOnNecklaceLengthOffset": "try_on_necklace_length_offset",
        "tryOnNecklaceScale": "try_on_necklace_scale",
        "tryOnNecklaceRotationOffset": "try_on_necklace_rotation_offset",
    }
    for key, value in updates.items():
        attr = field_map.get(key)
        if attr is None:
            continue
        setattr(product, attr, value)
    product.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(product, ["variants", "category"])
    return try_on_config_to_schema(product)


@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: str,
    body: AdminProductUpdateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> ProductSchema:
    product = await _get_product(db, product_id)
    updates = body.model_dump(exclude_unset=True)
    field_map = {
        "shortDescription": "short_description",
        "categoryId": "category_id",
        "primaryMaterial": "primary_material",
        "minPrice": "min_price",
        "careInstructions": "care_instructions",
        "relatedSlugs": "related_slugs",
        "aiGeneratedTags": "ai_generated_tags",
    }
    for key, value in updates.items():
        attr = field_map.get(key, key)
        setattr(product, attr, value)
    product.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(product, ["variants", "category"])
    return product_to_schema(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, db: DbSession, _admin: AdminUser) -> None:
    product = await _get_product(db, product_id)
    await db.delete(product)
    await db.commit()


@router.post(
    "/{product_id}/variants",
    response_model=ProductVariantSchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_variant(
    product_id: str,
    body: AdminVariantCreateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> ProductVariantSchema:
    await _get_product(db, product_id)
    sku_check = await db.execute(select(ProductVariant).where(ProductVariant.sku == body.sku))
    if sku_check.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    variant = ProductVariant(
        id=_new_id("var"),
        product_id=product_id,
        sku=body.sku,
        size=body.size,
        color=body.color,
        material=body.material,
        price_amount=body.priceAmount,
        price_currency=body.priceCurrency,
        stock=body.stock,
    )
    db.add(variant)
    await db.commit()
    await db.refresh(variant)
    return variant_to_schema(variant)


@router.put("/{product_id}/variants/{variant_id}", response_model=ProductVariantSchema)
async def update_variant(
    product_id: str,
    variant_id: str,
    body: AdminVariantUpdateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> ProductVariantSchema:
    variant = await _get_variant(db, product_id, variant_id)
    updates = body.model_dump(exclude_unset=True)
    field_map = {
        "priceAmount": "price_amount",
        "priceCurrency": "price_currency",
    }
    for key, value in updates.items():
        attr = field_map.get(key, key)
        setattr(variant, attr, value)
    await db.commit()
    await db.refresh(variant)
    return variant_to_schema(variant)


@router.delete("/{product_id}/variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_variant(
    product_id: str,
    variant_id: str,
    db: DbSession,
    _admin: AdminUser,
) -> None:
    variant = await _get_variant(db, product_id, variant_id)
    await db.delete(variant)
    await db.commit()


async def _get_product(db: AsyncSession, product_id: str) -> Product:
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.variants), selectinload(Product.category))
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


async def _get_variant(db: AsyncSession, product_id: str, variant_id: str) -> ProductVariant:
    result = await db.execute(
        select(ProductVariant).where(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
        )
    )
    variant = result.scalar_one_or_none()
    if variant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    return variant
