from __future__ import annotations

from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.discount import Discount
from app.schemas.discount import DiscountConditionsSchema, DiscountSchema


def discount_to_schema(discount: Discount) -> DiscountSchema:
    conditions = None
    if discount.conditions:
        conditions = DiscountConditionsSchema(**discount.conditions)
    return DiscountSchema(
        id=discount.id,
        code=discount.code,
        type=discount.type,
        value=discount.value,
        conditions=conditions,
        expiresAt=discount.expires_at.isoformat() if discount.expires_at else None,
        usageLimit=discount.usage_limit,
        usageCount=discount.usage_count,
        active=discount.active,
        createdAt=discount.created_at.isoformat(),
        updatedAt=discount.updated_at.isoformat(),
    )


def _parse_conditions(conditions: DiscountConditionsSchema | None) -> dict | None:
    if conditions is None:
        return None
    return conditions.model_dump(exclude_none=True)


async def get_discount_by_code(db: AsyncSession, code: str) -> Discount | None:
    normalized = code.strip().upper()
    result = await db.execute(select(Discount).where(Discount.code == normalized))
    return result.scalar_one_or_none()


def calculate_discount_amount(
    discount: Discount,
    subtotal: int,
    *,
    category_slugs: list[str] | None = None,
    product_ids: list[str] | None = None,
) -> int:
    if not discount.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Discount code is inactive"
        )

    now = datetime.now(UTC)
    if discount.expires_at and discount.expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Discount code has expired"
        )

    if discount.usage_limit is not None and discount.usage_count >= discount.usage_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Discount code usage limit reached",
        )

    conditions = discount.conditions or {}
    min_order = conditions.get("minOrderAmount")
    if min_order is not None and subtotal < min_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order amount of ₹{min_order / 100:.0f} required",
        )

    required_categories = conditions.get("categorySlugs") or []
    if required_categories and category_slugs:
        if not set(required_categories).intersection(category_slugs):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Discount does not apply to items in your cart",
            )

    required_products = conditions.get("productIds") or []
    if required_products and product_ids:
        if not set(required_products).intersection(product_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Discount does not apply to items in your cart",
            )

    if discount.type == "percentage":
        amount = int(subtotal * discount.value / 100)
    elif discount.type == "flat":
        amount = discount.value
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid discount type")

    return min(amount, subtotal)


async def validate_discount_for_cart(
    db: AsyncSession,
    code: str,
    subtotal: int,
    *,
    category_slugs: list[str] | None = None,
    product_ids: list[str] | None = None,
) -> tuple[Discount, int]:
    discount = await get_discount_by_code(db, code)
    if discount is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid discount code")

    amount = calculate_discount_amount(
        discount,
        subtotal,
        category_slugs=category_slugs,
        product_ids=product_ids,
    )
    return discount, amount


def normalize_discount_code(code: str) -> str:
    return code.strip().upper()


def parse_conditions_payload(conditions: DiscountConditionsSchema | None) -> dict | None:
    return _parse_conditions(conditions)
