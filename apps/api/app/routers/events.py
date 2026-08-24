from typing import Annotated

from fastapi import APIRouter, Cookie, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user_optional
from app.database import get_db
from app.schemas.auth import UserClaims
from app.services.events import EVENT_TYPES, log_event

router = APIRouter(prefix="/events", tags=["events"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[UserClaims | None, Depends(get_current_user_optional)]


class EventCreate(BaseModel):
    productId: str = Field(min_length=1)
    eventType: str = Field(pattern="^(viewed|added_to_cart|purchased|reviewed)$")


@router.post("")
async def create_event(
    body: EventCreate,
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
) -> dict[str, str]:
    if body.eventType not in EVENT_TYPES:
        return {"status": "ignored"}
    await log_event(
        db,
        product_id=body.productId,
        event_type=body.eventType,
        customer_id=user.sub if user else None,
        session_id=alankara_cart_session,
    )
    await db.commit()
    return {"status": "logged"}
