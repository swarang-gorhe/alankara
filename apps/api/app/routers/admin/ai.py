from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import require_admin
from app.database import get_db
from app.schemas.ai import (
    AdminAgentActionSchema,
    AdminAgentActionsSchema,
    AdminAgentRequestSchema,
    AdminAgentResponseSchema,
    ReindexResponseSchema,
    ReviewSummarySchema,
)
from app.schemas.auth import UserClaims
from app.services.ai.agents.runner import list_agent_actions, run_admin_agent
from app.services.ai.availability import require_ai, require_embeddings
from app.services.ai.chains.review_summary_chain import generate_product_review_summary
from app.services.ai.tasks import full_reindex_task, regenerate_review_summary_task

router = APIRouter(prefix="/admin", tags=["admin-ai"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]

AgentType = Literal["product", "inventory", "marketing", "reviews"]


@router.get("/ai/actions", response_model=AdminAgentActionsSchema)
async def get_agent_actions(_admin: AdminUser) -> AdminAgentActionsSchema:
    raw = list_agent_actions()
    agents = {
        agent_type: [AdminAgentActionSchema(id=a["id"], label=a["label"]) for a in actions]
        for agent_type, actions in raw.items()
    }
    return AdminAgentActionsSchema(agents=agents)


@router.post("/products/{product_id}/reviews/summarize", response_model=ReviewSummarySchema)
async def summarize_product_reviews(
    product_id: str,
    db: DbSession,
    _admin: AdminUser,
) -> ReviewSummarySchema:
    require_ai()
    try:
        summary = await generate_product_review_summary(db, product_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return ReviewSummarySchema(
        productId=product_id,
        summary=summary.generated_summary,
        generatedAt=summary.generated_at.isoformat(),
    )


@router.post(
    "/products/{product_id}/reviews/summarize/regenerate",
    response_model=ReindexResponseSchema,
)
async def regenerate_product_review_summary(
    product_id: str,
    _admin: AdminUser,
) -> ReindexResponseSchema:
    require_ai()
    task = regenerate_review_summary_task.delay(product_id)
    return ReindexResponseSchema(
        status="queued",
        taskId=task.id,
        message=f"Review summary regeneration queued for product {product_id}",
    )


@router.post("/ai/agents/{agent_type}", response_model=AdminAgentResponseSchema)
async def run_agent(
    agent_type: AgentType,
    body: AdminAgentRequestSchema,
    db: DbSession,
    admin: AdminUser,
) -> AdminAgentResponseSchema:
    require_ai()
    if not body.action and not body.prompt:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either 'action' or 'prompt' is required",
        )
    try:
        result = await run_admin_agent(
            db,
            agent_type=agent_type,
            prompt=body.prompt,
            action=body.action,
            user_id=admin.sub,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return AdminAgentResponseSchema(**result)


@router.post("/ai/reindex", response_model=ReindexResponseSchema)
async def reindex_knowledge_base(_admin: AdminUser) -> ReindexResponseSchema:
    require_embeddings()
    task = full_reindex_task.delay()
    return ReindexResponseSchema(
        status="queued",
        taskId=task.id,
        message="Full knowledge base re-index queued. Ensure Celery worker is running.",
    )
