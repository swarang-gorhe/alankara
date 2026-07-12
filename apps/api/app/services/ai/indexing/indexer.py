from __future__ import annotations

import json
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.artisan import Artisan
from app.models.embedding import DocumentEmbedding
from app.models.faq import FaqEntry
from app.models.product import Product
from app.models.review import Review
from app.services.ai.vectorstore.pgvector_store import upsert_chunks

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=["\n\n", "\n", ". ", " "],
)


def _brand_fixture_path() -> Path:
    return Path(__file__).resolve().parents[5] / "web" / "lib" / "fixtures" / "our-story.json"


async def _index_faq(db: AsyncSession, faq_id: str, action: str) -> int:
    if action == "delete":
        from sqlalchemy import delete

        await db.execute(
            delete(DocumentEmbedding).where(
                DocumentEmbedding.source_type == "faq",
                DocumentEmbedding.source_id == faq_id,
            )
        )
        await db.commit()
        return 0

    result = await db.execute(select(FaqEntry).where(FaqEntry.id == faq_id))
    entry = result.scalar_one_or_none()
    if entry is None or not entry.published:
        return 0

    text = f"FAQ [{entry.category}]\nQ: {entry.question}\nA: {entry.answer}"
    chunks = splitter.split_text(text)
    return await upsert_chunks(db, source_type="faq", source_id=faq_id, chunks=chunks)


async def _index_product(db: AsyncSession, product_id: str, action: str) -> int:
    if action == "delete":
        from sqlalchemy import delete

        await db.execute(
            delete(DocumentEmbedding).where(
                DocumentEmbedding.source_type == "product",
                DocumentEmbedding.source_id == product_id,
            )
        )
        await db.commit()
        return 0

    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        return 0

    parts = [
        f"Product: {product.name}",
        product.short_description or "",
        product.description,
        f"Materials: {', '.join(product.materials or [])}",
        f"Care: {product.care_instructions or 'See product page'}",
    ]
    text = "\n".join(p for p in parts if p)
    chunks = splitter.split_text(text)
    return await upsert_chunks(db, source_type="product", source_id=product_id, chunks=chunks)


async def _index_review(db: AsyncSession, review_id: str, action: str) -> int:
    if action == "delete":
        from sqlalchemy import delete

        await db.execute(
            delete(DocumentEmbedding).where(
                DocumentEmbedding.source_type == "review",
                DocumentEmbedding.source_id == review_id,
            )
        )
        await db.commit()
        return 0

    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if review is None or not review.approved:
        return 0

    text = f"Review {review.rating}/5 by {review.author_name}: {review.text}"
    chunks = splitter.split_text(text)
    return await upsert_chunks(db, source_type="review", source_id=review_id, chunks=chunks)


async def _index_artisan(db: AsyncSession, artisan_id: str) -> int:
    result = await db.execute(select(Artisan).where(Artisan.id == artisan_id))
    artisan = result.scalar_one_or_none()
    if artisan is None:
        return 0

    text = (
        f"Artisan: {artisan.name}, {artisan.title} — {artisan.location}\n"
        f"Specialty: {', '.join(artisan.specialty)}\n"
        f"{artisan.bio}\nQuote: {artisan.quote}"
    )
    chunks = splitter.split_text(text)
    return await upsert_chunks(db, source_type="artisan", source_id=artisan_id, chunks=chunks)


async def _index_brand_content(db: AsyncSession) -> int:
    path = _brand_fixture_path()
    if not path.exists():
        return 0

    data = json.loads(path.read_text(encoding="utf-8"))
    sections = [data.get("hero", {})] + data.get("sections", [])
    parts = []
    for section in sections:
        heading = section.get("heading") or section.get("title", "")
        body = section.get("body") or section.get("subtitle", "")
        quote = section.get("pullQuote", "")
        parts.append(f"{heading}\n{body}\n{quote}".strip())

    text = "\n\n".join(parts)
    chunks = splitter.split_text(text)
    return await upsert_chunks(db, source_type="brand", source_id="our-story", chunks=chunks)


async def index_document(
    db: AsyncSession,
    source_type: str,
    source_id: str,
    action: str = "upsert",
) -> int:
    if source_type == "faq":
        return await _index_faq(db, source_id, action)
    if source_type == "product":
        return await _index_product(db, source_id, action)
    if source_type == "review":
        return await _index_review(db, source_id, action)
    if source_type == "artisan":
        return await _index_artisan(db, source_id)
    if source_type == "brand":
        return await _index_brand_content(db)
    return 0


async def full_reindex(db: AsyncSession) -> dict[str, int]:
    counts: dict[str, int] = {"faq": 0, "product": 0, "review": 0, "artisan": 0, "brand": 0}

    faq_rows = (await db.execute(select(FaqEntry).where(FaqEntry.published.is_(True)))).scalars()
    for entry in faq_rows:
        counts["faq"] += await _index_faq(db, entry.id, "upsert")

    products = (await db.execute(select(Product))).scalars()
    for product in products:
        counts["product"] += await _index_product(db, product.id, "upsert")

    reviews = (
        await db.execute(select(Review).where(Review.approved.is_(True)))
    ).scalars()
    for review in reviews:
        counts["review"] += await _index_review(db, review.id, "upsert")

    artisans = (await db.execute(select(Artisan))).scalars()
    for artisan in artisans:
        counts["artisan"] += await _index_artisan(db, artisan.id)

    counts["brand"] = await _index_brand_content(db)
    return counts
