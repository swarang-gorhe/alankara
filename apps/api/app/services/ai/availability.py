from __future__ import annotations

from fastapi import HTTPException, status

from app.config import get_settings


def is_ai_configured() -> bool:
    settings = get_settings()
    if settings.llm_provider.lower() == "anthropic":
        return bool(settings.anthropic_api_key.strip())
    return bool(settings.openai_api_key.strip())


def is_embedding_configured() -> bool:
    return bool(get_settings().openai_api_key.strip())


def require_ai() -> None:
    if not is_ai_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI services unavailable. Set OPENAI_API_KEY in apps/api/.env "
                "(or ANTHROPIC_API_KEY with LLM_PROVIDER=anthropic)."
            ),
        )


def require_embeddings() -> None:
    if not is_embedding_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI embedding services unavailable. Set OPENAI_API_KEY in apps/api/.env.",
        )
