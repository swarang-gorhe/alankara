from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.order import Order
from app.models.product import ProductVariant
from app.schemas.admin import DashboardStatsSchema
from app.schemas.auth import UserClaims
from app.schemas.product import MoneySchema

router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]

LOW_STOCK_THRESHOLD = 5
REVENUE_STATUSES = ("paid", "processing", "shipped", "delivered", "pending_payment")


@router.get("/stats", response_model=DashboardStatsSchema)
async def dashboard_stats(db: DbSession, _admin: AdminUser) -> DashboardStatsSchema:
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.status.in_(REVENUE_STATUSES)
        )
    )
    revenue = revenue_result.scalar_one()

    orders_count = (
        await db.execute(select(func.count()).select_from(Order))
    ).scalar_one()

    pending_count = (
        await db.execute(
            select(func.count()).select_from(Order).where(Order.status == "pending_payment")
        )
    ).scalar_one()

    low_stock_stmt = (
        select(ProductVariant)
        .where(ProductVariant.stock <= LOW_STOCK_THRESHOLD)
        .options(selectinload(ProductVariant.product))
        .order_by(ProductVariant.stock)
        .limit(20)
    )
    low_stock_variants = (await db.execute(low_stock_stmt)).scalars().all()
    alerts = [
        {
            "variantId": v.id,
            "sku": v.sku,
            "productId": v.product_id,
            "productName": v.product.name if v.product else "",
            "stock": v.stock,
        }
        for v in low_stock_variants
    ]

    return DashboardStatsSchema(
        revenue=MoneySchema(amount=revenue, currency="INR"),
        ordersCount=orders_count,
        pendingOrdersCount=pending_count,
        lowStockAlerts=alerts,
    )
