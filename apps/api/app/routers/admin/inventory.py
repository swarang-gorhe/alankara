from __future__ import annotations

import csv
import io
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.product import ProductVariant
from app.schemas.auth import UserClaims

router = APIRouter(prefix="/admin/inventory", tags=["admin-inventory"])
DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


@router.get("/export")
async def export_inventory(db: DbSession, _admin: AdminUser) -> PlainTextResponse:
    result = await db.execute(
        select(ProductVariant).options(selectinload(ProductVariant.product)).order_by(ProductVariant.sku)
    )
    variants = result.scalars().all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["sku", "product_name", "stock"])
    for variant in variants:
        name = variant.product.name if variant.product else ""
        writer.writerow([variant.sku, name, variant.stock])
    return PlainTextResponse(buf.getvalue(), media_type="text/csv")


@router.post("/import")
async def import_inventory(
    db: DbSession,
    _admin: AdminUser,
    file: UploadFile = File(...),
) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload a CSV file")
    raw = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(raw))
    if not reader.fieldnames or "sku" not in {h.strip().lower() for h in reader.fieldnames}:
        raise HTTPException(status_code=400, detail="CSV must include a sku column")

    updated = 0
    missing: list[str] = []
    for row in reader:
        normalized = {k.strip().lower(): (v or "").strip() for k, v in row.items() if k}
        sku = normalized.get("sku")
        stock_raw = normalized.get("stock")
        if not sku or stock_raw in (None, ""):
            continue
        try:
            stock = int(stock_raw)
        except ValueError:
            continue
        variant = (
            await db.execute(select(ProductVariant).where(ProductVariant.sku == sku))
        ).scalar_one_or_none()
        if variant is None:
            missing.append(sku)
            continue
        variant.stock = max(stock, 0)
        updated += 1

    await db.commit()
    return {"updated": updated, "missing": missing}
