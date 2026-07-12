from __future__ import annotations

import math
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import require_admin
from app.database import get_db
from app.models.faq import FaqEntry
from app.schemas.auth import UserClaims
from app.schemas.faq import (
    FaqEntryCreateSchema,
    FaqEntrySchema,
    FaqEntryUpdateSchema,
    PaginatedFaqSchema,
)
from app.services.faq import faq_to_schema, new_faq_timestamps
from app.services.faq_indexing import schedule_faq_reindex

router = APIRouter(prefix="/admin/faq", tags=["admin-faq"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


@router.get("", response_model=PaginatedFaqSchema)
async def list_faq(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    category: str | None = None,
) -> PaginatedFaqSchema:
    base = select(FaqEntry)
    if category:
        base = base.where(FaqEntry.category == category)

    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
    offset = (page - 1) * page_size
    result = await db.execute(
        base.order_by(FaqEntry.sort_order, FaqEntry.question).offset(offset).limit(page_size)
    )
    entries = result.scalars().all()
    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedFaqSchema(
        items=[faq_to_schema(e) for e in entries],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.post("", response_model=FaqEntrySchema, status_code=status.HTTP_201_CREATED)
async def create_faq(
    body: FaqEntryCreateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> FaqEntrySchema:
    existing = await db.execute(select(FaqEntry).where(FaqEntry.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    now = new_faq_timestamps()
    entry = FaqEntry(
        id=_new_id("faq"),
        slug=body.slug,
        question=body.question,
        answer=body.answer,
        category=body.category,
        sort_order=body.sortOrder,
        published=body.published,
        created_at=now,
        updated_at=now,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    await schedule_faq_reindex(entry.id, action="upsert")
    return faq_to_schema(entry)


@router.get("/{faq_id}", response_model=FaqEntrySchema)
async def get_faq(faq_id: str, db: DbSession, _admin: AdminUser) -> FaqEntrySchema:
    entry = await _get_faq(db, faq_id)
    return faq_to_schema(entry)


@router.put("/{faq_id}", response_model=FaqEntrySchema)
async def update_faq(
    faq_id: str,
    body: FaqEntryUpdateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> FaqEntrySchema:
    entry = await _get_faq(db, faq_id)
    updates = body.model_dump(exclude_unset=True)
    field_map = {"sortOrder": "sort_order"}
    for key, value in updates.items():
        attr = field_map.get(key, key)
        setattr(entry, attr, value)
    entry.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(entry)
    await schedule_faq_reindex(entry.id, action="upsert")
    return faq_to_schema(entry)


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faq(faq_id: str, db: DbSession, _admin: AdminUser) -> None:
    entry = await _get_faq(db, faq_id)
    await db.delete(entry)
    await db.commit()
    await schedule_faq_reindex(faq_id, action="delete")


async def _get_faq(db: AsyncSession, faq_id: str) -> FaqEntry:
    result = await db.execute(select(FaqEntry).where(FaqEntry.id == faq_id))
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ entry not found")
    return entry
