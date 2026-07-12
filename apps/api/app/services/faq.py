from __future__ import annotations

import uuid
from datetime import UTC, datetime

from app.models.faq import FaqEntry
from app.schemas.faq import FaqEntrySchema


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def faq_to_schema(entry: FaqEntry) -> FaqEntrySchema:
    return FaqEntrySchema(
        id=entry.id,
        slug=entry.slug,
        question=entry.question,
        answer=entry.answer,
        category=entry.category,
        sortOrder=entry.sort_order,
        published=entry.published,
        createdAt=entry.created_at.isoformat(),
        updatedAt=entry.updated_at.isoformat(),
    )


def new_faq_timestamps() -> datetime:
    return datetime.now(UTC)
