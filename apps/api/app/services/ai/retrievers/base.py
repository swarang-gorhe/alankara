from __future__ import annotations

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.vectorstore.pgvector_store import similarity_search


class PgVectorRetriever(BaseRetriever):
    """Async retriever backed by the document_embeddings pgvector table."""

    db: AsyncSession
    source_types: list[str] | None = None
    k: int = 4

    class Config:
        arbitrary_types_allowed = True

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun,
    ) -> list[Document]:
        raise NotImplementedError("Use ainvoke for async retrieval")

    async def _aget_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun,
    ) -> list[Document]:
        return await similarity_search(
            self.db,
            query,
            source_types=self.source_types,
            k=self.k,
        )


def make_retriever(
    db: AsyncSession,
    *,
    source_types: list[str] | None = None,
    k: int = 4,
) -> PgVectorRetriever:
    return PgVectorRetriever(db=db, source_types=source_types, k=k)
