from __future__ import annotations

import uuid
from datetime import UTC, datetime

from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_ai_log import AdminAiLog
from app.services.ai.langchain_factory import get_chat_model
from app.services.ai.tools.inventory_tools import (
    get_sales_velocity,
    get_stock_levels,
    suggest_restock,
)
from app.services.ai.tools.order_tools import draft_campaign, get_active_discounts, get_slow_movers
from app.services.ai.tools.product_tools import draft_description, get_category, get_product
from app.services.ai.tools.review_tools import (
    draft_response,
    get_flagged_reviews,
    get_review_summary,
)

AGENT_PROMPTS: dict[str, str] = {
    "product": (
        "You are Alankara's product copy assistant. Use tools to fetch product data "
        "and draft descriptions or SEO copy. Never write to the database — return drafts only."
    ),
    "inventory": (
        "You are Alankara's inventory analyst. Use tools to inspect stock and sales velocity, "
        "then suggest restock priorities. Return actionable bullet points."
    ),
    "marketing": (
        "You are Alankara's marketing strategist. Use tools for discounts and slow movers, "
        "then draft campaign ideas. All outputs are drafts requiring admin approval."
    ),
    "reviews": (
        "You are Alankara's review response assistant. Flag reviews needing attention "
        "and draft gracious brand responses. Never publish automatically."
    ),
    "image": (
        "You are Alankara's image prep assistant (stub). Suggest crop presets and "
        "background removal workflow when product photos are available."
    ),
}

AGENT_TOOLS: dict[str, list] = {
    "product": [get_product, get_category, draft_description],
    "inventory": [get_stock_levels, get_sales_velocity, suggest_restock],
    "marketing": [get_slow_movers, get_active_discounts, draft_campaign],
    "reviews": [get_flagged_reviews, get_review_summary, draft_response],
    "image": [],
}


def _extract_agent_output(result: dict) -> tuple[str, list[str]]:
    messages = result.get("messages", [])
    tools_called: list[str] = []
    for msg in messages:
        tool_calls = getattr(msg, "tool_calls", None) or []
        for call in tool_calls:
            name = call.get("name") if isinstance(call, dict) else getattr(call, "name", None)
            if name:
                tools_called.append(str(name))

    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and msg.content:
            return str(msg.content), tools_called

    return str(result), tools_called


async def run_admin_agent(
    db: AsyncSession,
    *,
    agent_type: str,
    prompt: str,
    user_id: str,
) -> dict:
    if agent_type == "image":
        result_text = (
            "[Image agent stub] When product photos are uploaded, this agent will suggest "
            "crop presets (1:1, 4:5, 16:9) and background removal via future integration."
        )
        tools_called: list[str] = []
    else:
        llm = get_chat_model(temperature=0.3)
        tools = AGENT_TOOLS.get(agent_type, [])
        default_prompt = "You are a helpful Alankara admin assistant."
        agent = create_agent(
            llm,
            tools,
            system_prompt=AGENT_PROMPTS.get(agent_type, default_prompt),
        )
        result = await agent.ainvoke({"messages": [HumanMessage(content=prompt)]})
        result_text, tools_called = _extract_agent_output(result)

    log = AdminAiLog(
        id=f"ailog-{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        agent_type=agent_type,
        prompt=prompt,
        tools_called=tools_called or None,
        result=result_text,
        created_at=datetime.now(UTC),
    )
    db.add(log)
    await db.commit()

    return {
        "agentType": agent_type,
        "result": result_text,
        "toolsCalled": tools_called,
        "logId": log.id,
    }
