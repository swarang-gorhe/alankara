"""Wishlist API — requires authenticated user."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database import get_db
from app.models.product import Product
from app.models.wishlist import WishlistItem
from app.schemas.admin import WishlistItemSchema
from app.schemas.auth import UserClaims

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[UserClaims, Depends(get_current_user)]


@router.get("", response_model=list[WishlistItemSchema])
async def list_wishlist(db: DbSession, user: CurrentUser) -> list[WishlistItemSchema]:
    result = await db.execute(
        select(WishlistItem, Product)
        .join(Product, WishlistItem.product_id == Product.id)
        .where(WishlistItem.user_id == user.sub)
        .order_by(WishlistItem.created_at.desc())
    )
    items = []
    for wishlist_item, product in result.all():
        items.append(
            WishlistItemSchema(
                id=wishlist_item.id,
                productId=wishlist_item.product_id,
                variantId=wishlist_item.variant_id,
                productSlug=product.slug,
                productName=product.name,
                createdAt=wishlist_item.created_at.isoformat(),
            )
        )
    return items


@router.post(
    "/{product_id}",
    response_model=WishlistItemSchema,
    status_code=status.HTTP_201_CREATED,
)
async def add_to_wishlist(
    product_id: str,
    db: DbSession,
    user: CurrentUser,
    variant_id: str | None = None,
) -> WishlistItemSchema:
    product = (
        await db.execute(select(Product).where(Product.id == product_id))
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == user.sub,
            WishlistItem.product_id == product_id,
            WishlistItem.variant_id == variant_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already in wishlist")

    now = datetime.now(UTC)
    item = WishlistItem(
        id=f"wish-{uuid.uuid4().hex[:12]}",
        user_id=user.sub,
        product_id=product_id,
        variant_id=variant_id,
        created_at=now,
    )
    db.add(item)
    await db.commit()

    return WishlistItemSchema(
        id=item.id,
        productId=item.product_id,
        variantId=item.variant_id,
        productSlug=product.slug,
        productName=product.name,
        createdAt=item.created_at.isoformat(),
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(item_id: str, db: DbSession, user: CurrentUser) -> None:
    result = await db.execute(
        select(WishlistItem).where(
            WishlistItem.id == item_id,
            WishlistItem.user_id == user.sub,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found")
    await db.delete(item)
    await db.commit()
