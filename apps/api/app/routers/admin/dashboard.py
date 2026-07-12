from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.discount import Discount
from app.models.order import Order
from app.models.product import Product, ProductVariant
from app.models.review import Review
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

    products_count = (
        await db.execute(select(func.count()).select_from(Product))
    ).scalar_one()

    customers_count = (
        await db.execute(select(func.count(func.distinct(Order.email))).select_from(Order))
    ).scalar_one()

    reviews_count = (
        await db.execute(select(func.count()).select_from(Review))
    ).scalar_one()

    pending_reviews_count = (
        await db.execute(
            select(func.count()).select_from(Review).where(Review.approved.is_(False))
        )
    ).scalar_one()

    active_coupons_count = (
        await db.execute(
            select(func.count()).select_from(Discount).where(Discount.active.is_(True))
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

    recent_orders = (
        await db.execute(select(Order).order_by(Order.created_at.desc()).limit(5))
    ).scalars().all()
    recent_activity = [
        {
            "type": "order",
            "id": o.id,
            "label": f"Order {o.id} — {o.status}",
            "email": o.email,
            "amount": o.total_amount,
            "createdAt": o.created_at.isoformat(),
        }
        for o in recent_orders
    ]

    # Simplified monthly revenue buckets (last 6 months from orders)
    monthly_result = await db.execute(
        select(
            func.date_trunc("month", Order.created_at).label("month"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total"),
        )
        .where(Order.status.in_(REVENUE_STATUSES))
        .group_by("month")
        .order_by("month")
        .limit(6)
    )
    revenue_by_month = [
        {
            "month": row.month.strftime("%Y-%m") if row.month else "",
            "amount": int(row.total),
        }
        for row in monthly_result
    ]

    return DashboardStatsSchema(
        revenue=MoneySchema(amount=revenue, currency="INR"),
        ordersCount=orders_count,
        pendingOrdersCount=pending_count,
        productsCount=products_count,
        customersCount=customers_count,
        reviewsCount=reviews_count,
        pendingReviewsCount=pending_reviews_count,
        activeCouponsCount=active_coupons_count,
        lowStockAlerts=alerts,
        recentActivity=recent_activity,
        revenueByMonth=revenue_by_month,
    )
