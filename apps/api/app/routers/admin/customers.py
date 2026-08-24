from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import require_admin
from app.database import get_db
from app.models.customer_event import CustomerEvent
from app.models.order import Order
from app.models.product import Product
from app.schemas.auth import UserClaims

router = APIRouter(prefix="/admin/customers", tags=["admin-customers"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


class CustomerSchema(BaseModel):
    email: str
    orderCount: int
    totalSpent: int
    lastOrderAt: str | None = None


@router.get("", response_model=list[CustomerSchema])
async def list_customers(db: DbSession, _admin: AdminUser) -> list[CustomerSchema]:
    result = await db.execute(
        select(
            Order.email,
            func.count(Order.id).label("order_count"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total_spent"),
            func.max(Order.created_at).label("last_order"),
        )
        .group_by(Order.email)
        .order_by(func.max(Order.created_at).desc())
    )
    return [
        CustomerSchema(
            email=row.email,
            orderCount=row.order_count,
            totalSpent=int(row.total_spent),
            lastOrderAt=row.last_order.isoformat() if row.last_order else None,
        )
        for row in result
    ]


class CustomerEventSchema(BaseModel):
    id: str
    productId: str
    productName: str | None = None
    eventType: str
    createdAt: str


@router.get("/{email}/events", response_model=list[CustomerEventSchema])
async def customer_events(email: str, db: DbSession, _admin: AdminUser) -> list[CustomerEventSchema]:
    orders = (
        await db.execute(select(Order.user_id).where(Order.email == email))
    ).all()
    user_ids = {row.user_id for row in orders if row.user_id}
    if not user_ids:
        return []

    result = await db.execute(
        select(CustomerEvent)
        .where(CustomerEvent.customer_id.in_(user_ids))
        .order_by(CustomerEvent.created_at.desc())
        .limit(100)
    )
    events = result.scalars().all()
    product_ids = {e.product_id for e in events}
    products = {}
    if product_ids:
        rows = await db.execute(select(Product).where(Product.id.in_(product_ids)))
        products = {p.id: p.name for p in rows.scalars().all()}
    return [
        CustomerEventSchema(
            id=event.id,
            productId=event.product_id,
            productName=products.get(event.product_id),
            eventType=event.event_type,
            createdAt=event.created_at.isoformat(),
        )
        for event in events
    ]
