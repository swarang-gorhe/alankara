from __future__ import annotations

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.langchain_factory import get_chat_model
from app.services.ai.retrievers import create_chat_retriever
from app.services.ai.vectorstore.pgvector_store import FALLBACK_MESSAGE

FAQ_SYSTEM_PROMPT = """You are the Alankara customer care assistant — warm and concise.

STRICT RULES:
- Answer ONLY using the provided context from Alankara's knowledge base.
- If the context does not contain enough information, respond EXACTLY with:
  "{fallback}"
- Never invent policies, prices, shipping times, or product details.
- Keep answers under 120 words unless listing steps.
- Use a gracious, luxury tone — never salesy or robotic.
"""

_session_histories: dict[str, list[HumanMessage | AIMessage]] = {}


def _get_history(session_id: str) -> list[HumanMessage | AIMessage]:
    if session_id not in _session_histories:
        _session_histories[session_id] = []
    return _session_histories[session_id]


async def run_faq_chat(db: AsyncSession, *, message: str, session_id: str) -> dict:
    """Conversational RAG over pgvector with sliding-window memory."""
    retriever = create_chat_retriever(db, k=6)
    docs = await retriever.ainvoke(message)
    context = "\n\n".join(doc.page_content for doc in docs) if docs else "No context found."
    history = _get_history(session_id)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", FAQ_SYSTEM_PROMPT.format(fallback=FALLBACK_MESSAGE)),
            MessagesPlaceholder("chat_history"),
            ("human", "Context:\n{context}\n\nQuestion: {question}"),
        ]
    )
    llm = get_chat_model(temperature=0.1)
    chain = prompt | llm
    response = await chain.ainvoke(
        {
            "context": context,
            "chat_history": history[-10:],
            "question": message,
        }
    )
    answer = response.content if hasattr(response, "content") else str(response)
    if not answer.strip():
        answer = FALLBACK_MESSAGE

    history.extend([HumanMessage(content=message), AIMessage(content=answer)])
    _session_histories[session_id] = history[-10:]

    sources = [
        {
            "sourceType": doc.metadata.get("source_type"),
            "sourceId": doc.metadata.get("source_id"),
            "excerpt": doc.page_content[:200],
        }
        for doc in docs
    ]
    return {"answer": answer, "sources": sources, "sessionId": session_id}
