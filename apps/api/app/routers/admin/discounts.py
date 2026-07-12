from __future__ import annotations

import math
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import require_admin
from app.database import get_db
from app.models.discount import Discount
from app.schemas.auth import UserClaims
from app.schemas.discount import (
    DiscountCreateSchema,
    DiscountSchema,
    DiscountUpdateSchema,
    PaginatedDiscountsSchema,
)
from app.services.discount import (
    discount_to_schema,
    normalize_discount_code,
    parse_conditions_payload,
)

router = APIRouter(prefix="/admin/discounts", tags=["admin-discounts"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def _parse_expiry(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


@router.get("", response_model=PaginatedDiscountsSchema)
async def list_discounts(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> PaginatedDiscountsSchema:
    base = select(Discount)
    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
    offset = (page - 1) * page_size
    result = await db.execute(
        base.order_by(Discount.created_at.desc()).offset(offset).limit(page_size)
    )
    discounts = result.scalars().all()
    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedDiscountsSchema(
        items=[discount_to_schema(d) for d in discounts],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.post("", response_model=DiscountSchema, status_code=status.HTTP_201_CREATED)
async def create_discount(
    body: DiscountCreateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> DiscountSchema:
    code = normalize_discount_code(body.code)
    existing = await db.execute(select(Discount).where(Discount.code == code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Code already exists")

    now = datetime.now(UTC)
    discount = Discount(
        id=_new_id("disc"),
        code=code,
        type=body.type,
        value=body.value,
        conditions=parse_conditions_payload(body.conditions),
        expires_at=_parse_expiry(body.expiresAt),
        usage_limit=body.usageLimit,
        usage_count=0,
        active=body.active,
        created_at=now,
        updated_at=now,
    )
    db.add(discount)
    await db.commit()
    await db.refresh(discount)
    return discount_to_schema(discount)


@router.get("/{discount_id}", response_model=DiscountSchema)
async def get_discount(discount_id: str, db: DbSession, _admin: AdminUser) -> DiscountSchema:
    discount = await _get_discount(db, discount_id)
    return discount_to_schema(discount)


@router.put("/{discount_id}", response_model=DiscountSchema)
async def update_discount(
    discount_id: str,
    body: DiscountUpdateSchema,
    db: DbSession,
    _admin: AdminUser,
) -> DiscountSchema:
    discount = await _get_discount(db, discount_id)
    updates = body.model_dump(exclude_unset=True)
    if "code" in updates and updates["code"]:
        updates["code"] = normalize_discount_code(updates["code"])
    if "expiresAt" in updates:
        discount.expires_at = _parse_expiry(updates.pop("expiresAt"))
    if "usageLimit" in updates:
        discount.usage_limit = updates.pop("usageLimit")
    if "conditions" in updates:
        discount.conditions = parse_conditions_payload(updates.pop("conditions"))
    for key, value in updates.items():
        setattr(discount, key, value)
    discount.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(discount)
    return discount_to_schema(discount)


@router.delete("/{discount_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discount(discount_id: str, db: DbSession, _admin: AdminUser) -> None:
    discount = await _get_discount(db, discount_id)
    await db.delete(discount)
    await db.commit()


async def _get_discount(db: AsyncSession, discount_id: str) -> Discount:
    result = await db.execute(select(Discount).where(Discount.id == discount_id))
    discount = result.scalar_one_or_none()
    if discount is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")
    return discount
