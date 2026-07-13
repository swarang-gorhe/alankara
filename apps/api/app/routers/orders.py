from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import get_current_user
from app.database import get_db
from app.models.order import Order
from app.schemas.auth import UserClaims
from app.schemas.order import OrderItemSchema, OrderSchema, ShippingAddressSchema
from app.schemas.product import MoneySchema

router = APIRouter(prefix="/orders", tags=["orders"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[UserClaims, Depends(get_current_user)]


def _order_to_schema(order: Order) -> OrderSchema:
    addr_data = order.shipping_address or {}
    return OrderSchema(
        id=order.id,
        status=order.status,
        email=order.email,
        phone=order.phone,
        items=[
            OrderItemSchema(
                id=item.id,
                productId=item.product_id,
                variantId=item.variant_id,
                productName=item.product_name,
                variantLabel=item.variant_label,
                sku=item.sku,
                quantity=item.quantity,
                unitPrice=MoneySchema(
                    amount=item.unit_price_amount,
                    currency=item.unit_price_currency,
                ),
                lineTotal=MoneySchema(
                    amount=item.line_total_amount,
                    currency=item.unit_price_currency,
                ),
            )
            for item in order.items
        ],
        subtotal=MoneySchema(amount=order.subtotal_amount, currency=order.currency),
        discountCode=order.discount_code,
        discountAmount=MoneySchema(amount=order.discount_amount, currency=order.currency)
        if order.discount_amount
        else None,
        total=MoneySchema(amount=order.total_amount, currency=order.currency),
        shippingAddress=ShippingAddressSchema(**addr_data),
        createdAt=order.created_at.isoformat(),
    )


@router.get("", response_model=list[OrderSchema])
async def list_my_orders(db: DbSession, user: CurrentUser) -> list[OrderSchema]:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == user.sub)
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().unique().all()
    return [_order_to_schema(o) for o in orders]
