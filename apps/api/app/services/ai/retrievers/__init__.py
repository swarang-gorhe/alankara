from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.retrievers.base import make_retriever

FAQ_SOURCE_TYPES = ["faq", "policy"]


def create_faq_retriever(db: AsyncSession, *, k: int = 5):
    return make_retriever(db, source_types=FAQ_SOURCE_TYPES, k=k)


def create_product_retriever(db: AsyncSession, *, k: int = 4):
    return make_retriever(db, source_types=["product"], k=k)


def create_brand_retriever(db: AsyncSession, *, k: int = 4):
    return make_retriever(db, source_types=["brand", "artisan"], k=k)


def create_review_retriever(db: AsyncSession, *, k: int = 6):
    return make_retriever(db, source_types=["review"], k=k)


def create_chat_retriever(db: AsyncSession, *, k: int = 6):
    return make_retriever(
        db,
        source_types=["faq", "policy", "product", "brand", "artisan"],
        k=k,
    )
