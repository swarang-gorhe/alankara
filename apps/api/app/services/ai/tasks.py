from __future__ import annotations

import asyncio
import logging

from app.celery_app import celery_app
from app.database import async_session_maker
from app.services.ai.chains.insights_chain import generate_global_insights
from app.services.ai.chains.review_summary_chain import generate_product_review_summary
from app.services.ai.indexing.indexer import full_reindex, index_document

logger = logging.getLogger(__name__)


def _run_async(coro):
    return asyncio.run(coro)


@celery_app.task(name="ai.index_document", bind=True, max_retries=2)
def index_document_task(self, source_type: str, source_id: str, action: str = "upsert") -> dict:
    try:
        async def _work():
            async with async_session_maker() as db:
                count = await index_document(db, source_type, source_id, action)
                return {"source_type": source_type, "source_id": source_id, "chunks": count}

        return _run_async(_work())
    except Exception as exc:
        logger.exception("index_document failed: %s", exc)
        raise self.retry(exc=exc, countdown=30) from exc


@celery_app.task(name="ai.regenerate_review_summary", bind=True, max_retries=2)
def regenerate_review_summary_task(self, product_id: str) -> dict:
    try:
        async def _work():
            async with async_session_maker() as db:
                summary = await generate_product_review_summary(db, product_id)
                return {"product_id": product_id, "summary_id": summary.id}

        return _run_async(_work())
    except Exception as exc:
        logger.exception("regenerate_review_summary failed: %s", exc)
        raise self.retry(exc=exc, countdown=60) from exc


@celery_app.task(name="ai.regenerate_global_insights", bind=True, max_retries=2)
def regenerate_global_insights_task(self) -> dict:
    try:
        async def _work():
            async with async_session_maker() as db:
                return await generate_global_insights(db)

        return _run_async(_work())
    except Exception as exc:
        logger.exception("regenerate_global_insights failed: %s", exc)
        raise self.retry(exc=exc, countdown=60) from exc


@celery_app.task(name="ai.full_reindex", bind=True, max_retries=1)
def full_reindex_task(self) -> dict:
    try:
        async def _work():
            async with async_session_maker() as db:
                return await full_reindex(db)

        return _run_async(_work())
    except Exception as exc:
        logger.exception("full_reindex failed: %s", exc)
        raise self.retry(exc=exc, countdown=120) from exc
