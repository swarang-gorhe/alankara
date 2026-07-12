from __future__ import annotations

from datetime import UTC, datetime

from langchain_core.tools import tool
from sqlalchemy import select

from app.database import async_session_maker
from app.models.discount import Discount
from app.models.product import Product


@tool
def get_active_discounts() -> str:
    """List currently active discount codes."""
    import asyncio

    async def _run() -> str:
        now = datetime.now(UTC)
        async with async_session_maker() as db:
            result = await db.execute(
                select(Discount).where(
                    Discount.active.is_(True),
                    (Discount.expires_at.is_(None)) | (Discount.expires_at > now),
                )
            )
            discounts = result.scalars().all()
            if not discounts:
                return "No active discounts."
            return "\n".join(
                f"{d.code}: {d.type} {d.value} (used {d.usage_count}x)" for d in discounts
            )

    return asyncio.run(_run())


@tool
def get_slow_movers() -> str:
    """Identify products with high stock relative to price tier (heuristic)."""
    import asyncio

    async def _run() -> str:
        async with async_session_maker() as db:
            from sqlalchemy.orm import selectinload

            result = await db.execute(
                select(Product).options(selectinload(Product.variants))
            )
            products = result.scalars().unique().all()
            slow = []
            for product in products:
                total_stock = sum(v.stock for v in product.variants)
                if total_stock > 20:
                    slow.append(f"{product.name}: {total_stock} units across variants")
            return "\n".join(slow[:20]) or "No obvious slow movers by stock heuristic."

    return asyncio.run(_run())


@tool
def draft_campaign(goal: str = "boost slow movers") -> str:
    """Draft a marketing campaign — returns text only, no DB writes."""
    discounts = get_active_discounts.invoke({})
    slow = get_slow_movers.invoke({})
    return (
        f"[DRAFT CAMPAIGN — admin approval required]\nGoal: {goal}\n\n"
        f"Active discounts:\n{discounts}\n\nSlow movers:\n{slow}\n\n"
        "Suggested: Limited-time bundle offer on slow movers with WELCOME10 follow-up."
    )
