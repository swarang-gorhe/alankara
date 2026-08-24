from __future__ import annotations

import math
import re
import uuid
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.try_on import TryOnEvent, TryOnRequest
from app.schemas.auth import UserClaims

router = APIRouter(prefix="/admin/try-on-requests", tags=["admin-try-on"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]

STATUSES = {
    "new",
    "contacted",
    "customization_discussion",
    "confirmed",
    "order_created",
    "cancelled",
}


class TryOnRequestOut(BaseModel):
    id: str
    productId: str
    productName: str
    photoUrl: str | None = None
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    instagramHandle: str | None = None
    message: str | None = None
    customizationRequest: dict[str, Any] | None = None
    status: str
    createdAt: str
    updatedAt: str
    adminNotes: str | None = None
    customPrice: int | None = None


class TryOnRequestUpdate(BaseModel):
    status: str | None = None
    customizationRequest: dict[str, Any] | None = None
    adminNotes: str | None = None
    customPrice: int | None = None
    message: str | None = None


class ParseCustomizationIn(BaseModel):
    message: str = Field(..., min_length=1)


def _row_to_out(row: TryOnRequest) -> TryOnRequestOut:
    custom = row.customization_request or {}
    return TryOnRequestOut(
        id=str(row.id),
        productId=row.product_id,
        productName=row.product.name if row.product else row.product_id,
        photoUrl=row.photo_url,
        name=row.name,
        phone=row.phone,
        email=row.email,
        instagramHandle=row.instagram_handle,
        message=row.message,
        customizationRequest=row.customization_request,
        status=row.status,
        createdAt=row.created_at.isoformat() if row.created_at else "",
        updatedAt=row.updated_at.isoformat() if row.updated_at else "",
        adminNotes=custom.get("adminNotes") if isinstance(custom, dict) else None,
        customPrice=custom.get("customPrice") if isinstance(custom, dict) else None,
    )


@router.get("")
async def list_try_on_requests(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> dict:
    base = select(TryOnRequest).options(selectinload(TryOnRequest.product))
    if status_filter:
        base = base.where(TryOnRequest.status == status_filter)
    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
    result = await db.execute(
        base.order_by(TryOnRequest.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    rows = result.scalars().unique().all()
    return {
        "items": [_row_to_out(r) for r in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, math.ceil(total / page_size)) if total else 1,
    }


@router.get("/analytics")
async def try_on_analytics(db: DbSession, _admin: AdminUser) -> dict:
    opens = (
        await db.execute(
            select(func.count()).where(TryOnEvent.event_type == "open")
        )
    ).scalar_one()
    shares = (
        await db.execute(
            select(func.count()).where(TryOnEvent.event_type == "share")
        )
    ).scalar_one()
    order_clicks = (
        await db.execute(
            select(func.count()).where(TryOnEvent.event_type == "order_click")
        )
    ).scalar_one()
    order_completed = (
        await db.execute(
            select(func.count()).where(TryOnEvent.event_type == "order_completed")
        )
    ).scalar_one()
    attempts = opens or 1
    return {
        "attempts": opens,
        "shareRate": round(shares / attempts, 3),
        "orderClickRate": round(order_clicks / attempts, 3),
        "conversionRate": round(order_completed / attempts, 3),
        "shares": shares,
        "orderClicks": order_clicks,
        "ordersCompleted": order_completed,
    }


@router.get("/{request_id}")
async def get_try_on_request(
    request_id: str, db: DbSession, _admin: AdminUser
) -> TryOnRequestOut:
    try:
        rid = uuid.UUID(request_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid id") from exc
    result = await db.execute(
        select(TryOnRequest)
        .where(TryOnRequest.id == rid)
        .options(selectinload(TryOnRequest.product))
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Not found")
    return _row_to_out(row)


@router.patch("/{request_id}")
async def update_try_on_request(
    request_id: str,
    body: TryOnRequestUpdate,
    db: DbSession,
    _admin: AdminUser,
) -> TryOnRequestOut:
    try:
        rid = uuid.UUID(request_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid id") from exc
    result = await db.execute(
        select(TryOnRequest)
        .where(TryOnRequest.id == rid)
        .options(selectinload(TryOnRequest.product))
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Not found")
    if body.status is not None:
        if body.status not in STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status")
        row.status = body.status
    if body.message is not None:
        row.message = body.message
    custom = dict(row.customization_request or {})
    if body.customizationRequest is not None:
        custom.update(body.customizationRequest)
    if body.adminNotes is not None:
        custom["adminNotes"] = body.adminNotes
    if body.customPrice is not None:
        custom["customPrice"] = body.customPrice
    row.customization_request = custom
    row.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(row, ["product"])
    return _row_to_out(row)


@router.post("/{request_id}/parse-customization")
async def parse_customization(
    request_id: str,
    body: ParseCustomizationIn,
    db: DbSession,
    _admin: AdminUser,
) -> dict:
    """Structured suggestion only — never auto-applies to an order."""
    try:
        rid = uuid.UUID(request_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid id") from exc
    result = await db.execute(
        select(TryOnRequest)
        .where(TryOnRequest.id == rid)
        .options(selectinload(TryOnRequest.product))
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Not found")

    text = body.message.strip()
    colour_match = re.search(
        r"(?:in|colour|color|shade)\s+([a-zA-Z][a-zA-Z\s-]{1,40})",
        text,
        re.I,
    )
    preserve: list[str] = []
    if re.search(r"same shape|keep (the )?shape|don'?t change shape", text, re.I):
        preserve.append("shape")
    if re.search(r"same size|keep (the )?size", text, re.I):
        preserve.append("size")
    if re.search(r"pearl", text, re.I) and "add" not in text.lower():
        preserve.append("pearl accents")
    suggestion = {
        "product": row.product.name if row.product else row.product_id,
        "requestedChanges": [
            part.strip()
            for part in re.split(r"[.;\n]", text)
            if part.strip()
        ][:6]
        or [text],
        "fieldsToPreserve": preserve or ["silhouette", "backing"],
        "suggestedColour": colour_match.group(1).strip() if colour_match else None,
        "status": "suggestion_for_admin_review",
        "rawMessage": text,
    }
    return {"suggestion": suggestion, "autoApplied": False}
