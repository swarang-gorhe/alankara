from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product
from app.models.try_on import TryOnEvent, TryOnRequest
from app.services.storage import get_storage_backend

router = APIRouter(prefix="/try-on", tags=["try-on"])

DbSession = Annotated[AsyncSession, Depends(get_db)]

EVENT_TYPES = {
    "open",
    "camera_start",
    "photo_upload",
    "try_on_success",
    "product_change",
    "share",
    "order_click",
    "order_completed",
}


class TryOnEventIn(BaseModel):
    sessionId: str = Field(..., min_length=1, max_length=128)
    productId: str | None = None
    eventType: str


class TryOnRequestIn(BaseModel):
    productId: str
    photoUrl: str | None = None
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    instagramHandle: str | None = None
    message: str | None = None
    customizationRequest: dict[str, Any] | None = None
    sessionId: str | None = None


@router.post("/events", status_code=status.HTTP_204_NO_CONTENT)
async def create_try_on_event(body: TryOnEventIn, db: DbSession) -> None:
    if body.eventType not in EVENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid event type")
    if body.productId:
        exists = await db.execute(select(Product.id).where(Product.id == body.productId))
        if exists.scalar_one_or_none() is None:
            body.productId = None
    db.add(
        TryOnEvent(
            id=uuid.uuid4(),
            session_id=body.sessionId,
            product_id=body.productId,
            event_type=body.eventType,
            created_at=datetime.now(UTC),
        )
    )
    await db.commit()


@router.post("/upload")
async def upload_try_on_photo(
    db: DbSession,
    file: UploadFile = File(...),
    productId: str = Form(...),
    sessionId: str = Form(...),
) -> dict:
    """Explicit share upload only — called from Share My Look form."""
    product = await db.execute(select(Product).where(Product.id == productId))
    if product.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Product not found")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    storage = get_storage_backend()
    filename = f"tryon_{sessionId}_{file.filename or 'look.jpg'}"
    key = storage.save(filename, content, content_type=file.content_type or "image/jpeg")
    url = storage.get_url(key)
    return {"url": url, "key": key}


@router.post("/requests", status_code=status.HTTP_201_CREATED)
async def create_try_on_request(body: TryOnRequestIn, db: DbSession) -> dict:
    product = await db.execute(select(Product).where(Product.id == body.productId))
    if product.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Product not found")
    row = TryOnRequest(
        id=uuid.uuid4(),
        product_id=body.productId,
        photo_url=body.photoUrl,
        name=body.name,
        phone=body.phone,
        email=body.email,
        instagram_handle=body.instagramHandle,
        message=body.message,
        customization_request=body.customizationRequest,
        status="new",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(row)
    await db.commit()
    return {"id": str(row.id), "status": row.status}
