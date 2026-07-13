from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import require_admin
from app.database import get_db
from app.models.order import Order
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
