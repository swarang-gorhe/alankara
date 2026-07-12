from __future__ import annotations

from datetime import UTC, datetime, timedelta

from langchain_core.tools import tool
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.database import async_session_maker
from app.models.order import Order, OrderItem
from app.models.product import ProductVariant


@tool
def get_stock_levels() -> str:
    """List variant SKUs with current stock counts."""
    import asyncio

    async def _run() -> str:
        async with async_session_maker() as db:
            result = await db.execute(
                select(ProductVariant)
                .options(selectinload(ProductVariant.product))
                .order_by(ProductVariant.stock.asc())
            )
            variants = result.scalars().all()
            lines = [
                f"{v.sku} ({v.product.name if v.product else v.product_id}): {v.stock} units"
                for v in variants
            ]
            return "\n".join(lines[:50]) or "No variants found."

    return asyncio.run(_run())


@tool
def get_sales_velocity(days: int = 30) -> str:
    """Estimate units sold per product variant over the last N days."""
    import asyncio

    async def _run() -> str:
        since = datetime.now(UTC) - timedelta(days=days)
        async with async_session_maker() as db:
            stmt = (
                select(
                    OrderItem.variant_id,
                    func.sum(OrderItem.quantity).label("units"),
                )
                .join(Order, Order.id == OrderItem.order_id)
                .where(Order.created_at >= since)
                .group_by(OrderItem.variant_id)
                .order_by(func.sum(OrderItem.quantity).desc())
            )
            rows = (await db.execute(stmt)).all()
            if not rows:
                return f"No orders in the last {days} days."
            lines = [f"Variant {row.variant_id}: {row.units} units" for row in rows[:30]]
            return "\n".join(lines)

    return asyncio.run(_run())


@tool
def suggest_restock(threshold: int = 5) -> str:
    """Suggest variants to restock based on low stock and recent sales."""
    stock_report = get_stock_levels.invoke({})
    velocity = get_sales_velocity.invoke({"days": 30})
    return (
        f"Low-stock threshold: {threshold}\n\nStock levels:\n{stock_report}\n\n"
        f"Recent velocity:\n{velocity}\n\n"
        "Recommendation: Prioritize restock for fast-moving SKUs below threshold."
    )
