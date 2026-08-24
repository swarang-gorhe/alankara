from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import require_admin
from app.database import get_db
from app.schemas.auth import UserClaims
from app.services.store_settings import list_store_settings, upsert_setting

router = APIRouter(prefix="/admin/settings", tags=["admin-settings"])
DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


class StoreSettingsSchema(BaseModel):
    lowStockThreshold: int = Field(ge=0, le=1000)
    currency: str = Field(min_length=3, max_length=8)
    taxRateBps: int = Field(ge=0, le=10000)


class StoreSettingsUpdate(BaseModel):
    lowStockThreshold: int | None = Field(None, ge=0, le=1000)
    currency: str | None = Field(None, min_length=3, max_length=8)
    taxRateBps: int | None = Field(None, ge=0, le=10000)


def _to_schema(raw: dict) -> StoreSettingsSchema:
    return StoreSettingsSchema(
        lowStockThreshold=int(raw.get("low_stock_threshold") or 5),
        currency=str(raw.get("currency") or "INR"),
        taxRateBps=int(raw.get("tax_rate_bps") or 0),
    )


@router.get("", response_model=StoreSettingsSchema)
async def get_settings(db: DbSession, _admin: AdminUser) -> StoreSettingsSchema:
    return _to_schema(await list_store_settings(db))


@router.put("", response_model=StoreSettingsSchema)
async def update_settings(
    body: StoreSettingsUpdate,
    db: DbSession,
    _admin: AdminUser,
) -> StoreSettingsSchema:
    if body.lowStockThreshold is not None:
        await upsert_setting(db, "low_stock_threshold", body.lowStockThreshold)
    if body.currency is not None:
        await upsert_setting(db, "currency", body.currency.upper())
    if body.taxRateBps is not None:
        await upsert_setting(db, "tax_rate_bps", body.taxRateBps)
    await db.commit()
    return _to_schema(await list_store_settings(db))
