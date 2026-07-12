from __future__ import annotations

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

from app.config import get_settings
from app.services.ai.availability import require_ai


def get_chat_model(*, temperature: float = 0.2) -> BaseChatModel:
    require_ai()
    settings = get_settings()
    provider = settings.llm_provider.lower()

    if provider == "anthropic":
        return ChatAnthropic(
            api_key=settings.anthropic_api_key,
            model=settings.anthropic_chat_model,
            temperature=temperature,
        )

    return ChatOpenAI(
        api_key=settings.openai_api_key,
        model=settings.openai_chat_model,
        temperature=temperature,
    )
