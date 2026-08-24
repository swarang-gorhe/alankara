"""Atomic inventory reservation for checkout."""

from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import ProductVariant


class InsufficientStockError(Exception):
    def __init__(self, sku: str, available: int, requested: int) -> None:
        self.sku = sku
        self.available = available
        self.requested = requested
        super().__init__(f"{sku} has only {available} in stock (requested {requested})")


async def reserve_stock(db: AsyncSession, items: list[tuple[str, int]]) -> None:
    """Decrement stock for (variant_id, qty) under row locks.

    Raises InsufficientStockError if any line cannot be fulfilled.
    Callers should run this inside the same transaction as order creation.
    """
    for variant_id, quantity in items:
        result = await db.execute(
            select(ProductVariant).where(ProductVariant.id == variant_id).with_for_update()
        )
        variant = result.scalar_one_or_none()
        if variant is None:
            raise InsufficientStockError(variant_id, 0, quantity)
        if variant.stock < quantity:
            raise InsufficientStockError(variant.sku, variant.stock, quantity)

        stmt = (
            update(ProductVariant)
            .where(ProductVariant.id == variant_id, ProductVariant.stock >= quantity)
            .values(stock=ProductVariant.stock - quantity)
        )
        updated = await db.execute(stmt)
        if updated.rowcount != 1:
            raise InsufficientStockError(variant.sku, variant.stock, quantity)


async def restore_stock(db: AsyncSession, items: list[tuple[str, int]]) -> None:
    for variant_id, quantity in items:
        await db.execute(
            update(ProductVariant)
            .where(ProductVariant.id == variant_id)
            .values(stock=ProductVariant.stock + quantity)
        )
