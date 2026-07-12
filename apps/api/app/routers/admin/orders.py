from __future__ import annotations

import math
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.order import Order
from app.schemas.admin import AdminOrderSchema, AdminOrderUpdateSchema, PaginatedAdminOrdersSchema
from app.schemas.auth import UserClaims
from app.schemas.product import MoneySchema

router = APIRouter(prefix="/admin/orders", tags=["admin-orders"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


def order_to_admin_schema(order: Order) -> AdminOrderSchema:
    return AdminOrderSchema(
        id=order.id,
        status=order.status,
        email=order.email,
        phone=order.phone,
        items=[
            {
                "id": item.id,
                "productId": item.product_id,
                "variantId": item.variant_id,
                "productName": item.product_name,
                "variantLabel": item.variant_label,
                "sku": item.sku,
                "quantity": item.quantity,
                "unitPrice": MoneySchema(
                    amount=item.unit_price_amount,
                    currency=item.unit_price_currency,
                ),
                "lineTotal": MoneySchema(
                    amount=item.line_total_amount,
                    currency=item.unit_price_currency,
                ),
            }
            for item in order.items
        ],
        subtotal=MoneySchema(amount=order.subtotal_amount, currency=order.currency),
        discountCode=order.discount_code,
        discountAmount=MoneySchema(amount=order.discount_amount, currency=order.currency),
        total=MoneySchema(amount=order.total_amount, currency=order.currency),
        shippingAddress=order.shipping_address,
        fulfillmentNotes=order.fulfillment_notes,
        createdAt=order.created_at.isoformat(),
        updatedAt=order.updated_at.isoformat(),
    )


@router.get("", response_model=PaginatedAdminOrdersSchema)
async def list_orders(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> PaginatedAdminOrdersSchema:
    base = select(Order).options(selectinload(Order.items))
    if status_filter:
        base = base.where(Order.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
    offset = (page - 1) * page_size
    result = await db.execute(
        base.order_by(Order.created_at.desc()).offset(offset).limit(page_size)
    )
    orders = result.scalars().unique().all()
    pages = max(1, math.ceil(total / page_size)) if total else 1

    return PaginatedAdminOrdersSchema(
        items=[order_to_admin_schema(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{order_id}", response_model=AdminOrderSchema)
async def get_order(order_id: str, db: DbSession, _admin: AdminUser) -> AdminOrderSchema:
    order = await _get_order(db, order_id)
    return order_to_admin_schema(order)


@router.patch("/{order_id}", response_model=AdminOrderSchema)
async def update_order(
    order_id: str,
    body: AdminOrderUpdateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> AdminOrderSchema:
    order = await _get_order(db, order_id)
    if body.status is not None:
        order.status = body.status
    if body.fulfillmentNotes is not None:
        order.fulfillment_notes = body.fulfillmentNotes
    order.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(order, ["items"])
    return order_to_admin_schema(order)


async def _get_order(db: AsyncSession, order_id: str) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
