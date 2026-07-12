from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.discount import ValidateDiscountRequest, ValidateDiscountResponse
from app.services.discount import validate_discount_for_cart

router = APIRouter(prefix="/discounts", tags=["discounts"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/validate", response_model=ValidateDiscountResponse)
async def validate_discount(
    body: ValidateDiscountRequest, db: DbSession
) -> ValidateDiscountResponse:
    try:
        discount, amount = await validate_discount_for_cart(
            db,
            body.code,
            body.subtotalAmount,
        )
        return ValidateDiscountResponse(
            valid=True,
            code=discount.code,
            discountAmount=amount,
            message=f"Discount applied: ₹{amount / 100:.0f} off",
        )
    except HTTPException as exc:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return ValidateDiscountResponse(valid=False, message=detail)
