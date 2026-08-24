from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.setting import Setting

DEFAULTS: dict[str, int | str] = {
    "low_stock_threshold": 5,
    "currency": "INR",
    "tax_rate_bps": 0,
}


async def get_setting(db: AsyncSession, key: str, default=None):
    row = await db.get(Setting, key)
    if row is None:
        return DEFAULTS.get(key, default)
    return row.value


async def get_low_stock_threshold(db: AsyncSession) -> int:
    value = await get_setting(db, "low_stock_threshold", 5)
    try:
        return int(value)
    except (TypeError, ValueError):
        return 5


async def upsert_setting(db: AsyncSession, key: str, value) -> Setting:
    row = await db.get(Setting, key)
    now = datetime.now(UTC)
    if row is None:
        row = Setting(key=key, value=value, updated_at=now)
        db.add(row)
    else:
        row.value = value
        row.updated_at = now
    return row


async def list_store_settings(db: AsyncSession) -> dict:
    keys = list(DEFAULTS.keys())
    result = await db.execute(select(Setting).where(Setting.key.in_(keys)))
    found = {row.key: row.value for row in result.scalars().all()}
    payload = {key: found.get(key, DEFAULTS[key]) for key in keys}
    payload["low_stock_threshold"] = int(payload["low_stock_threshold"])
    payload["tax_rate_bps"] = int(payload.get("tax_rate_bps") or 0)
    return payload
