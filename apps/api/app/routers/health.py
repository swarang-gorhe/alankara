from fastapi import APIRouter

from app.config import get_settings
from app.services.ai.availability import is_ai_configured, is_embedding_configured

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str | bool]:
    settings = get_settings()
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": settings.api_version,
        "aiConfigured": is_ai_configured(),
        "embeddingsConfigured": is_embedding_configured(),
    }
