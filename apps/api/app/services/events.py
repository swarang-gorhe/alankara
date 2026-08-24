from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer_event import CustomerEvent

EVENT_TYPES = frozenset({"viewed", "added_to_cart", "purchased", "reviewed"})


async def log_event(
    db: AsyncSession,
    *,
    product_id: str,
    event_type: str,
    customer_id: str | None = None,
    session_id: str | None = None,
) -> CustomerEvent | None:
    if event_type not in EVENT_TYPES:
        return None
    event = CustomerEvent(
        id=f"evt-{uuid.uuid4().hex[:12]}",
        customer_id=customer_id,
        session_id=session_id,
        product_id=product_id,
        event_type=event_type,
        created_at=datetime.now(UTC),
    )
    db.add(event)
    return event
