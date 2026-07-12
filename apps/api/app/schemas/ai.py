from __future__ import annotations

from pydantic import BaseModel, Field


class FaqChatRequestSchema(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str | None = Field(None, alias="sessionId")

    model_config = {"populate_by_name": True}


class FaqChatSourceSchema(BaseModel):
    source_type: str | None = Field(None, alias="sourceType")
    source_id: str | None = Field(None, alias="sourceId")
    excerpt: str

    model_config = {"populate_by_name": True}


class FaqChatResponseSchema(BaseModel):
    answer: str
    sources: list[FaqChatSourceSchema]
    session_id: str = Field(..., alias="sessionId")

    model_config = {"populate_by_name": True}


class AIInsightsSchema(BaseModel):
    status: str
    summary: str
    positive_themes: list[str] = Field(..., alias="positiveThemes")
    concerns: list[str]
    trending_praise: list[str] = Field(..., alias="trendingPraise")
    last_updated: str | None = Field(None, alias="lastUpdated")

    model_config = {"populate_by_name": True}


class ReviewSummarySchema(BaseModel):
    product_id: str = Field(..., alias="productId")
    summary: str
    generated_at: str = Field(..., alias="generatedAt")

    model_config = {"populate_by_name": True}


class AdminAgentRequestSchema(BaseModel):
    action: str | None = Field(None, min_length=1, max_length=128)
    prompt: str | None = Field(None, min_length=1, max_length=4000)
    context: dict | None = None


class AdminAgentActionSchema(BaseModel):
    id: str
    label: str


class AdminAgentActionsSchema(BaseModel):
    agents: dict[str, list[AdminAgentActionSchema]]


class AdminAgentResponseSchema(BaseModel):
    agent_type: str = Field(..., alias="agentType")
    action: str | None = None
    result: str
    tools_called: list | None = Field(None, alias="toolsCalled")
    log_id: str = Field(..., alias="logId")

    model_config = {"populate_by_name": True}


class ReindexResponseSchema(BaseModel):
    status: str
    task_id: str | None = Field(None, alias="taskId")
    message: str

    model_config = {"populate_by_name": True}
