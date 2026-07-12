import math
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.product import Product
from app.schemas.ai import ReviewSummarySchema
from app.schemas.mappers import product_to_schema
from app.schemas.product import PaginatedProductsSchema, ProductDetailSchema, ProductSchema
from app.services.ai.chains.review_summary_chain import get_product_review_summary

router = APIRouter(prefix="/products", tags=["products"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _apply_product_filters(
    stmt,
    *,
    search: str | None,
    category: str | None,
    material: str | None,
    min_price: int | None,
    max_price: int | None,
):
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
                Product.short_description.ilike(pattern),
            )
        )
    if category:
        from app.models.category import Category

        stmt = stmt.join(Category).where(Category.slug == category)
    if material:
        stmt = stmt.where(Product.primary_material == material)
    if min_price is not None:
        stmt = stmt.where(Product.min_price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.min_price <= max_price)
    return stmt


@router.get("", response_model=PaginatedProductsSchema)
async def list_products(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, alias="q"),
    category: str | None = None,
    material: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
) -> PaginatedProductsSchema:
    base = select(Product).options(
        selectinload(Product.variants),
        selectinload(Product.category),
    )
    filtered = _apply_product_filters(
        base,
        search=search,
        category=category,
        material=material,
        min_price=min_price,
        max_price=max_price,
    )

    count_stmt = select(func.count()).select_from(filtered.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    offset = (page - 1) * page_size
    stmt = filtered.order_by(Product.name).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    products = result.scalars().unique().all()

    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedProductsSchema(
        items=[product_to_schema(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{slug}", response_model=ProductDetailSchema)
async def get_product(slug: str, db: DbSession) -> ProductDetailSchema:
    stmt = (
        select(Product)
        .where(Product.slug == slug)
        .options(
            selectinload(Product.variants),
            selectinload(Product.category),
        )
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    related: list[ProductSchema] = []
    related_slugs = product.related_slugs or []
    if related_slugs:
        rel_stmt = (
            select(Product)
            .where(Product.slug.in_(related_slugs))
            .options(
                selectinload(Product.variants),
                selectinload(Product.category),
            )
        )
        rel_result = await db.execute(rel_stmt)
        related = [product_to_schema(p) for p in rel_result.scalars().unique().all()]

    base = product_to_schema(product)
    return ProductDetailSchema(**base.model_dump(), relatedProducts=related)


@router.get("/{slug}/review-summary", response_model=ReviewSummarySchema)
async def get_product_review_summary_endpoint(slug: str, db: DbSession) -> ReviewSummarySchema:
    stmt = select(Product).where(Product.slug == slug)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    summary = await get_product_review_summary(db, product.id)
    if summary is None:
        raise HTTPException(status_code=404, detail="No review summary available for this product")

    return ReviewSummarySchema(
        productId=product.id,
        summary=summary.generated_summary,
        generatedAt=summary.generated_at.isoformat(),
    )
