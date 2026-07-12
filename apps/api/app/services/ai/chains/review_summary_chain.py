from __future__ import annotations

import uuid
from datetime import UTC, datetime

from langchain_core.prompts import ChatPromptTemplate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review, ReviewSummary
from app.services.ai.langchain_factory import get_chat_model

SUMMARY_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You summarize verified customer reviews for Alankara luxury jewellery. "
            "Write 2-3 sentences highlighting overall sentiment and key themes. "
            "Be factual — only use review text provided. No invented praise.",
        ),
        (
            "human",
            "Product: {product_name}\n\nReviews:\n{reviews_text}\n\nSummary:",
        ),
    ]
)


async def _fetch_product_reviews(db: AsyncSession, product_id: str) -> tuple[str, list[Review]]:
    from app.models.product import Product

    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if product is None:
        raise ValueError(f"Product not found: {product_id}")

    reviews_result = await db.execute(
        select(Review)
        .where(Review.product_id == product_id, Review.approved.is_(True))
        .order_by(Review.created_at.desc())
        .limit(40)
    )
    reviews = list(reviews_result.scalars().all())
    return product.name, reviews


def _format_reviews(reviews: list[Review]) -> str:
    if not reviews:
        return "No approved reviews yet."
    lines = []
    for review in reviews:
        lines.append(f"- {review.rating}/5 by {review.author_name}: {review.text}")
    return "\n".join(lines)


async def generate_product_review_summary(db: AsyncSession, product_id: str) -> ReviewSummary:
    product_name, reviews = await _fetch_product_reviews(db, product_id)
    llm = get_chat_model(temperature=0.2)
    chain = SUMMARY_PROMPT | llm
    response = await chain.ainvoke(
        {"product_name": product_name, "reviews_text": _format_reviews(reviews)}
    )
    summary_text = response.content if hasattr(response, "content") else str(response)

    existing = await db.execute(
        select(ReviewSummary).where(
            ReviewSummary.product_id == product_id,
            ReviewSummary.scope == "product",
        )
    )
    row = existing.scalar_one_or_none()
    now = datetime.now(UTC)
    if row:
        row.generated_summary = summary_text
        row.generated_at = now
    else:
        row = ReviewSummary(
            id=f"summary-{uuid.uuid4().hex[:12]}",
            product_id=product_id,
            scope="product",
            generated_summary=summary_text,
            generated_at=now,
        )
        db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def get_product_review_summary(db: AsyncSession, product_id: str) -> ReviewSummary | None:
    result = await db.execute(
        select(ReviewSummary).where(
            ReviewSummary.product_id == product_id,
            ReviewSummary.scope == "product",
        )
    )
    return result.scalar_one_or_none()
