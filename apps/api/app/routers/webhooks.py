from __future__ import annotations

import hmac
import logging
from hashlib import sha256
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import get_db
from app.models.order import Order
from app.routers.checkout import mark_order_paid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
DbSession = Annotated[AsyncSession, Depends(get_db)]


def _stripe_signature_valid(payload: bytes, header: str, secret: str) -> bool:
    try:
        parts = dict(item.split("=", 1) for item in header.split(",") if "=" in item)
        timestamp = parts.get("t")
        signature = parts.get("v1")
        if not timestamp or not signature:
            return False
        signed = f"{timestamp}.".encode() + payload
        expected = hmac.new(secret.encode(), signed, sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception:  # noqa: BLE001
        return False


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: DbSession,
    stripe_signature: Annotated[str | None, Header(alias="Stripe-Signature")] = None,
) -> dict[str, str]:
    settings = get_settings()
    payload = await request.body()
    if settings.stripe_webhook_secret:
        if not stripe_signature or not _stripe_signature_valid(
            payload, stripe_signature, settings.stripe_webhook_secret
        ):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    import json

    try:
        event = json.loads(payload.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid payload") from exc

    event_type = event.get("type")
    data_object = (event.get("data") or {}).get("object") or {}
    if event_type != "payment_intent.succeeded":
        return {"status": "ignored"}

    intent_id = data_object.get("id")
    order_id = (data_object.get("metadata") or {}).get("order_id")
    stmt = select(Order).options(selectinload(Order.items))
    if order_id:
        stmt = stmt.where(Order.id == order_id)
    elif intent_id:
        stmt = stmt.where(Order.payment_intent_id == intent_id)
    else:
        return {"status": "ignored"}

    order = (await db.execute(stmt)).scalar_one_or_none()
    if order is None:
        logger.warning("stripe.webhook unknown order intent=%s order=%s", intent_id, order_id)
        return {"status": "ignored"}

    await mark_order_paid(db, order)
    return {"status": "ok"}
