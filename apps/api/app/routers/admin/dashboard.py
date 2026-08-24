from datetime import UTC, datetime, timedelta
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
from app.services.store_settings import get_low_stock_threshold

router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]

REVENUE_STATUSES = ("paid", "processing", "shipped", "delivered", "pending_payment")
PAID_STATUSES = ("paid", "processing", "shipped", "delivered")


@router.get("/stats", response_model=DashboardStatsSchema)
async def dashboard_stats(db: DbSession, _admin: AdminUser) -> DashboardStatsSchema:
    threshold = await get_low_stock_threshold(db)
    now = datetime.now(UTC)
    week_ago = now - timedelta(days=7)
    day_30 = now - timedelta(days=30)

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
        .where(ProductVariant.stock <= threshold)
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

    week_orders = (
        await db.execute(
            select(func.count()).select_from(Order).where(Order.created_at >= week_ago)
        )
    ).scalar_one()
    week_revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.created_at >= week_ago,
                Order.status.in_(PAID_STATUSES),
            )
        )
    ).scalar_one()
    avg_rating = (
        await db.execute(
            select(func.avg(Review.rating)).where(Review.approved.is_(True))
        )
    ).scalar_one()

    daily_result = await db.execute(
        select(
            func.date_trunc("day", Order.created_at).label("day"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total"),
        )
        .where(Order.created_at >= day_30, Order.status.in_(REVENUE_STATUSES))
        .group_by("day")
        .order_by("day")
    )
    revenue_last_30 = [
        {"day": row.day.strftime("%Y-%m-%d") if row.day else "", "amount": int(row.total)}
        for row in daily_result
    ]

    stock_result = await db.execute(
        select(
            Product.category_id,
            func.coalesce(func.sum(ProductVariant.stock), 0).label("stock"),
        )
        .join(ProductVariant, ProductVariant.product_id == Product.id)
        .group_by(Product.category_id)
    )
    from app.models.category import Category

    categories = {
        c.id: c.name
        for c in (await db.execute(select(Category))).scalars().all()
    }
    stock_by_category = [
        {
            "categoryId": row.category_id,
            "category": categories.get(row.category_id, row.category_id),
            "stock": int(row.stock),
        }
        for row in stock_result
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
        revenueLast30Days=revenue_last_30,
        stockByCategory=stock_by_category,
        ordersThisWeek=week_orders,
        revenueThisWeek=MoneySchema(amount=int(week_revenue), currency="INR"),
        averageRating=round(float(avg_rating), 2) if avg_rating is not None else None,
    )
