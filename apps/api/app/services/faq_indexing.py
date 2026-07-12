"""FAQ indexing stub — wired to Celery RAG pipeline in Phase 7."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


async def schedule_faq_reindex(faq_id: str, *, action: str = "upsert") -> None:
    """Queue FAQ entry for vector re-indexing (Phase 7 Celery job)."""
    logger.info("FAQ RAG re-index stub: faq_id=%s action=%s", faq_id, action)


async def schedule_full_faq_reindex() -> None:
    """Queue full FAQ knowledge base refresh (Phase 7)."""
    logger.info("FAQ full RAG re-index stub triggered")
