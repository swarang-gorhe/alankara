"""Vision tagging for admin inventory photos. Suggestions only — never auto-applied."""

from __future__ import annotations

import json
import logging
import re
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.admin_ai_log import AdminAiLog
from app.services.ai.availability import is_ai_configured
from app.services.ai.langchain_factory import get_chat_model

logger = logging.getLogger(__name__)

ANALYZE_PROMPT = (
    "You are cataloguing handmade cloth and fabric jewellery for Alankara, "
    "a luxury heritage house.\n\n"
    "Return STRICT JSON only, no markdown, in this exact shape:\n"
    "{\n"
    '  "category": "Necklace | Earrings | Bangles | Anklets | '
    'Hair Accessories | Brooch | Other",\n'
    '  "material": "short material guess, e.g. Silk thread & gold zari",\n'
    '  "tags": ["3-6 short lowercase style tags"],\n'
    '  "estimatedPriceRange": "e.g. ₹800–₹1,400"\n'
    "}\n\n"
    "Do not invent a product name or description. Guess only from the photograph.\n"
)


def _parse_json_payload(text: str) -> dict | None:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if not match:
            return None
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
    if not isinstance(data, dict):
        return None
    tags = data.get("tags") or []
    if not isinstance(tags, list):
        tags = []
    return {
        "category": str(data.get("category") or "Other"),
        "material": str(data.get("material") or ""),
        "tags": [str(t).lower() for t in tags][:6],
        "estimatedPriceRange": str(data.get("estimatedPriceRange") or ""),
    }


async def analyze_product_image(
    db: AsyncSession,
    *,
    image_bytes: bytes,
    mime_type: str,
    user_id: str,
) -> dict:
    if not is_ai_configured():
        return {
            "ok": False,
            "error": (
                "AI is not configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY "
                "to continue tagging by hand."
            ),
        }

    import base64

    b64 = base64.b64encode(image_bytes).decode("ascii")
    data_url = f"data:{mime_type};base64,{b64}"

    try:
        model = get_chat_model(temperature=0)
        message = {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": ANALYZE_PROMPT},
            ],
        }
        response = await model.ainvoke([message])
        raw = getattr(response, "content", "") or ""
        if isinstance(raw, list):
            raw = "".join(
                block.get("text", "") if isinstance(block, dict) else str(block) for block in raw
            )
        suggestion = _parse_json_payload(str(raw))
        if suggestion is None:
            raise ValueError("Model did not return valid JSON")
    except Exception as exc:  # noqa: BLE001 — graceful admin path
        logger.warning("vision.analyze_failed: %s", exc)
        db.add(
            AdminAiLog(
                id=f"ail-{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                agent_type="image",
                prompt="analyze-product-image",
                tools_called=None,
                result=f"error: {exc}",
                created_at=datetime.now(UTC),
            )
        )
        await db.commit()
        return {
            "ok": False,
            "error": "Could not analyze this photograph. You can tag the piece by hand.",
        }

    db.add(
        AdminAiLog(
            id=f"ail-{uuid.uuid4().hex[:12]}",
            user_id=user_id,
            agent_type="image",
            prompt="analyze-product-image",
            tools_called=[{"accepted": False}],
            result=json.dumps(suggestion),
            created_at=datetime.now(UTC),
        )
    )
    await db.commit()
    settings = get_settings()
    return {"ok": True, "suggestion": suggestion, "model": settings.anthropic_chat_model}
