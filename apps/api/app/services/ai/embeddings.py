from __future__ import annotations

from langchain_openai import OpenAIEmbeddings

from app.config import get_settings
from app.services.ai.availability import require_embeddings


def get_embeddings() -> OpenAIEmbeddings:
    require_embeddings()
    settings = get_settings()
    return OpenAIEmbeddings(
        api_key=settings.openai_api_key,
        model=settings.openai_embedding_model,
    )
