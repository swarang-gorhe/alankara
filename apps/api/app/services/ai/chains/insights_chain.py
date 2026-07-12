from __future__ import annotations

import json
from datetime import UTC, datetime

from langchain_core.prompts import ChatPromptTemplate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review, ReviewSummary
from app.services.ai.langchain_factory import get_chat_model
from app.services.ai.retrievers import create_review_retriever

INSIGHTS_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You analyze Alankara customer reviews and return structured JSON only. "
            "Fields: summary (2 sentences), positiveThemes (array of 3-5 strings), "
            "concerns (array of 1-3 strings), trendingPraise (array of 2-4 short phrases). "
            "Base everything on the review context — no fabrication.",
        ),
        ("human", "Review context:\n{context}\n\nReturn valid JSON only."),
    ]
)


async def _review_context(db: AsyncSession, query: str) -> str:
    retriever = create_review_retriever(db, k=12)
    docs = await retriever.ainvoke(query)
    if docs:
        return "\n\n".join(doc.page_content for doc in docs)

    result = await db.execute(
        select(Review)
        .where(Review.approved.is_(True))
        .order_by(Review.created_at.desc())
        .limit(30)
    )
    reviews = result.scalars().all()
    return "\n".join(f"{r.rating}/5: {r.text}" for r in reviews)


async def generate_global_insights(db: AsyncSession) -> dict:
    context = await _review_context(db, "customer praise complaints themes sentiment")
    llm = get_chat_model(temperature=0.3)
    chain = INSIGHTS_PROMPT | llm
    response = await chain.ainvoke({"context": context})
    raw = response.content if hasattr(response, "content") else str(response)

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 and end > start else {}

    default_summary = "Our customers cherish the craftsmanship and care in every piece."
    summary = parsed.get("summary", default_summary)
    positive = parsed.get("positiveThemes", parsed.get("positive_themes", []))
    concerns = parsed.get("concerns", [])
    trending = parsed.get("trendingPraise", parsed.get("trending_praise", []))

    payload = {
        "summary": summary,
        "positiveThemes": positive,
        "concerns": concerns,
        "trendingPraise": trending,
    }
    stored = json.dumps(payload)

    now = datetime.now(UTC)
    existing = await db.execute(
        select(ReviewSummary).where(
            ReviewSummary.scope == "global",
            ReviewSummary.product_id.is_(None),
        )
    )
    row = existing.scalar_one_or_none()
    if row:
        row.generated_summary = stored
        row.generated_at = now
    else:
        row = ReviewSummary(
            id="summary-global",
            product_id=None,
            scope="global",
            generated_summary=stored,
            generated_at=now,
        )
        db.add(row)
    await db.commit()

    return {
        "status": "live",
        "summary": summary,
        "positiveThemes": positive,
        "concerns": concerns,
        "trendingPraise": trending,
        "lastUpdated": now.isoformat(),
    }


async def get_global_insights(db: AsyncSession) -> dict:
    result = await db.execute(
        select(ReviewSummary).where(
            ReviewSummary.scope == "global",
            ReviewSummary.product_id.is_(None),
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        return {
            "status": "placeholder",
            "summary": "Insights will appear once reviews are indexed and AI is configured.",
            "positiveThemes": [],
            "concerns": [],
            "trendingPraise": [],
            "lastUpdated": None,
        }

    structured = {}
    try:
        structured = json.loads(row.generated_summary)
        if isinstance(structured, dict) and "summary" in structured:
            return {
                "status": "live",
                "summary": structured.get("summary", ""),
                "positiveThemes": structured.get("positiveThemes", []),
                "concerns": structured.get("concerns", []),
                "trendingPraise": structured.get("trendingPraise", []),
                "lastUpdated": row.generated_at.isoformat(),
            }
    except json.JSONDecodeError:
        pass

    return {
        "status": "live",
        "summary": row.generated_summary,
        "positiveThemes": [],
        "concerns": [],
        "trendingPraise": [],
        "lastUpdated": row.generated_at.isoformat(),
    }
