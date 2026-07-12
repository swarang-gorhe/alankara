"""FAQ indexing — queues Celery RAG pipeline on FAQ changes."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


async def schedule_faq_reindex(faq_id: str, *, action: str = "upsert") -> None:
    """Queue FAQ entry for vector re-indexing."""
    try:
        from app.services.ai.tasks import index_document_task

        index_document_task.delay("faq", faq_id, action)
        logger.info("Queued FAQ re-index: faq_id=%s action=%s", faq_id, action)
    except Exception as exc:
        logger.warning("Could not queue FAQ re-index (is Redis/Celery running?): %s", exc)


async def schedule_full_faq_reindex() -> None:
    """Queue full FAQ knowledge base refresh."""
    try:
        from app.services.ai.tasks import full_reindex_task

        full_reindex_task.delay()
        logger.info("Queued full knowledge base re-index")
    except Exception as exc:
        logger.warning("Could not queue full re-index: %s", exc)
