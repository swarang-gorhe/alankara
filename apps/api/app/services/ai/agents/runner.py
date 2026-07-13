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
        "You are Alankara's product copy assistant for cloth and fabric jewellery. "
        "Use tools to fetch product data and draft descriptions, SEO titles, meta, captions, "
        "alt text, or keywords. Never write to the database — return drafts only."
    ),
    "inventory": (
        "You are Alankara's inventory analyst for textile jewellery. Use tools to inspect stock "
        "and sales velocity, then suggest restock priorities. Return actionable bullet points."
    ),
    "marketing": (
        "You are Alankara's marketing strategist for sustainable fabric adornments. Use tools "
        "for discounts and slow movers, then draft Instagram, Facebook, Pinterest, email, or "
        "WhatsApp campaign copy. All outputs are drafts requiring admin approval."
    ),
    "reviews": (
        "You are Alankara's review analyst. Summarize sentiment, flag complaints, extract "
        "trending keywords and themes. Draft gracious brand responses when asked. "
        "Never publish automatically."
    ),
}

AGENT_TOOLS: dict[str, list] = {
    "product": [get_product, get_category, draft_description],
    "inventory": [get_stock_levels, get_sales_velocity, suggest_restock],
    "marketing": [get_slow_movers, get_active_discounts, draft_campaign],
    "reviews": [get_flagged_reviews, get_review_summary, draft_response],
}

# Predefined audited actions — admin triggers these explicitly, not open-ended prompts
AGENT_ACTIONS: dict[str, dict[str, str]] = {
    "product": {
        "luxury-description": (
            "Fetch the first featured product and draft a luxury editorial product description "
            "emphasizing hand-finished textile craft. Return draft only."
        ),
        "seo-meta": (
            "Draft SEO meta title and description for our bestselling cloth earrings. "
            "Include fabric keywords. Return draft only."
        ),
        "alt-text": (
            "Suggest alt text for product images across our fabric necklace category. "
            "Accessibility-focused, descriptive. Return draft only."
        ),
        "social-caption": (
            "Draft an Instagram caption for our Banarasi Festive Set highlighting coordinated "
            "textile jewellery. Return draft only."
        ),
    },
    "inventory": {
        "low-stock-report": (
            "Use get_stock_levels to list all variants at or below 5 units. "
            "Summarize by category with urgency ranking."
        ),
        "restock-suggestions": (
            "Use suggest_restock and get_sales_velocity to recommend restock priorities "
            "for the next two weeks. Actionable bullet points."
        ),
        "velocity-analysis": (
            "Analyze sales velocity for fabric bracelet and cloth earring variants. "
            "Identify fast movers and stagnating SKUs."
        ),
    },
    "marketing": {
        "instagram-post": (
            "Draft an Instagram post for our sustainable fashion accessories collection. "
            "Include hashtags. Draft only."
        ),
        "festival-campaign": (
            "Use get_active_discounts and draft a festival campaign email for textile "
            "jewellery sets. Draft only."
        ),
        "whatsapp-broadcast": (
            "Draft a WhatsApp broadcast announcing new shibori cloth earrings. "
            "Warm, concise, under 300 characters. Draft only."
        ),
        "slow-mover-promo": (
            "Use get_slow_movers to identify slow inventory and draft a Pinterest pin "
            "description with promotion angle. Draft only."
        ),
    },
    "reviews": {
        "summarize-all": (
            "Summarize overall customer sentiment from recent reviews. Highlight positive "
            "themes, concerns, and trending keywords about fabric jewellery."
        ),
        "flag-complaints": (
            "Use get_flagged_reviews to list reviews needing attention. Categorize by "
            "complaint type (sizing, delivery, quality)."
        ),
        "trending-keywords": (
            "Extract trending praise keywords and themes from our review corpus. "
            "Present as a chart-friendly bullet list."
        ),
        "draft-response": (
            "Use get_flagged_reviews to find the most recent hidden review and draft "
            "a gracious brand response. Do not publish."
        ),
    },
}


def resolve_action_prompt(agent_type: str, action: str | None, prompt: str | None) -> str:
    if action:
        actions = AGENT_ACTIONS.get(agent_type, {})
        if action not in actions:
            available = ", ".join(actions.keys()) or "none"
            raise ValueError(
                f"Unknown action '{action}' for agent '{agent_type}'. "
                f"Available: {available}"
            )
        return actions[action]
    if prompt:
        return prompt
    raise ValueError("Either 'action' or 'prompt' is required")


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
    prompt: str | None = None,
    action: str | None = None,
    user_id: str,
) -> dict:
    resolved_prompt = resolve_action_prompt(agent_type, action, prompt)

    llm = get_chat_model(temperature=0.3)
    tools = AGENT_TOOLS.get(agent_type, [])
    default_prompt = "You are a helpful Alankara admin assistant."
    agent = create_agent(
        llm,
        tools,
        system_prompt=AGENT_PROMPTS.get(agent_type, default_prompt),
    )
    result = await agent.ainvoke({"messages": [HumanMessage(content=resolved_prompt)]})
    result_text, tools_called = _extract_agent_output(result)

    log = AdminAiLog(
        id=f"ailog-{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        agent_type=agent_type,
        prompt=f"[action={action}] {resolved_prompt}" if action else resolved_prompt,
        tools_called=tools_called or None,
        result=result_text,
        created_at=datetime.now(UTC),
    )
    db.add(log)
    await db.commit()

    return {
        "agentType": agent_type,
        "action": action,
        "result": result_text,
        "toolsCalled": tools_called,
        "logId": log.id,
    }


def list_agent_actions() -> dict[str, list[dict[str, str]]]:
    return {
        agent_type: [
            {"id": action_id, "label": action_id.replace("-", " ").title()}
            for action_id in actions
        ]
        for agent_type, actions in AGENT_ACTIONS.items()
    }
