from __future__ import annotations

import uuid
from typing import Any

from langchain_core.documents import Document
from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.embedding import DocumentEmbedding
from app.services.ai.embeddings import get_embeddings

FALLBACK_MESSAGE = (
    "I'm not sure about that — our team would love to help. "
    "Reach us at hello@alankara.com or via WhatsApp on our contact page."
)


def _new_chunk_id() -> str:
    return f"emb-{uuid.uuid4().hex[:12]}"


async def embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = get_embeddings()
    return await embeddings.aembed_documents(texts)


async def upsert_chunks(
    db: AsyncSession,
    *,
    source_type: str,
    source_id: str,
    chunks: list[str],
    metadata: dict[str, Any] | None = None,
) -> int:
    if not chunks:
        await db.execute(
            delete(DocumentEmbedding).where(
                DocumentEmbedding.source_type == source_type,
                DocumentEmbedding.source_id == source_id,
            )
        )
        await db.commit()
        return 0

    vectors = await embed_texts(chunks)
    await db.execute(
        delete(DocumentEmbedding).where(
            DocumentEmbedding.source_type == source_type,
            DocumentEmbedding.source_id == source_id,
        )
    )

    for idx, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True)):
        db.add(
            DocumentEmbedding(
                id=_new_chunk_id(),
                source_type=source_type,
                source_id=source_id,
                content=chunk,
                embedding=vector,
            )
        )
        _ = metadata  # reserved for future metadata column
        _ = idx

    await db.commit()
    return len(chunks)


async def similarity_search(
    db: AsyncSession,
    query: str,
    *,
    source_types: list[str] | None = None,
    k: int = 4,
) -> list[Document]:
    embeddings = get_embeddings()
    query_vector = await embeddings.aembed_query(query)
    vector_literal = "[" + ",".join(str(v) for v in query_vector) + "]"

    type_filter = ""
    params: dict[str, Any] = {"k": k, "query_vector": vector_literal}
    if source_types:
        type_filter = "AND source_type = ANY(:source_types)"
        params["source_types"] = source_types

    sql = text(
        f"""
        SELECT source_type, source_id, content
        FROM document_embeddings
        WHERE embedding IS NOT NULL {type_filter}
        ORDER BY embedding <=> CAST(:query_vector AS vector)
        LIMIT :k
        """
    )
    result = await db.execute(sql, params)
    rows = result.mappings().all()
    return [
        Document(
            page_content=row["content"],
            metadata={"source_type": row["source_type"], "source_id": row["source_id"]},
        )
        for row in rows
    ]


async def count_embeddings(db: AsyncSession) -> int:
    result = await db.execute(select(DocumentEmbedding.id))
    return len(result.scalars().all())
