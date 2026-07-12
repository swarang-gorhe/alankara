from __future__ import annotations

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import async_session_maker
from app.models.review import Review, ReviewSummary


@tool
def get_flagged_reviews() -> str:
    """List reviews pending moderation (not approved)."""
    import asyncio

    async def _run() -> str:
        async with async_session_maker() as db:
            result = await db.execute(
                select(Review)
                .where(Review.approved.is_(False))
                .options(selectinload(Review.product))
                .limit(20)
            )
            reviews = result.scalars().all()
            if not reviews:
                return "No flagged reviews."
            return "\n".join(
                f"{r.id} — {r.product.name if r.product else r.product_id}: "
                f"{r.rating}/5 {r.text[:120]}"
                for r in reviews
            )

    return asyncio.run(_run())


@tool
def get_review_summary(product_id: str) -> str:
    """Fetch cached AI summary for a product's reviews."""
    import asyncio

    async def _run() -> str:
        async with async_session_maker() as db:
            result = await db.execute(
                select(ReviewSummary).where(
                    ReviewSummary.product_id == product_id,
                    ReviewSummary.scope == "product",
                )
            )
            row = result.scalar_one_or_none()
            return row.generated_summary if row else "No cached summary — run regenerate first."

    return asyncio.run(_run())


@tool
def draft_response(review_id: str) -> str:
    """Draft a gracious brand response to a review — does not publish."""
    import asyncio

    async def _run() -> str:
        async with async_session_maker() as db:
            result = await db.execute(select(Review).where(Review.id == review_id))
            review = result.scalar_one_or_none()
            if review is None:
                return f"Review {review_id} not found."
            return (
                f"[DRAFT RESPONSE — admin must approve]\n"
                f"Re: {review.author_name}'s {review.rating}-star review\n"
                f"\"{review.text[:200]}\"\n\n"
                "Dear {name}, thank you for sharing your experience with Alankara..."
            ).replace("{name}", review.author_name)

    return asyncio.run(_run())
