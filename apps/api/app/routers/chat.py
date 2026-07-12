from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.ai import FaqChatRequestSchema, FaqChatResponseSchema, FaqChatSourceSchema
from app.services.ai.availability import require_ai, require_embeddings
from app.services.ai.chains.faq_chain import run_faq_chat

router = APIRouter(prefix="/chat", tags=["chat"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/faq", response_model=FaqChatResponseSchema)
async def faq_chat(body: FaqChatRequestSchema, db: DbSession) -> FaqChatResponseSchema:
    require_ai()
    require_embeddings()
    session_id = body.session_id or f"sess-{uuid.uuid4().hex[:12]}"
    result = await run_faq_chat(db, message=body.message, session_id=session_id)
    return FaqChatResponseSchema(
        answer=result["answer"],
        sources=[FaqChatSourceSchema(**s) for s in result["sources"]],
        sessionId=result["sessionId"],
    )
