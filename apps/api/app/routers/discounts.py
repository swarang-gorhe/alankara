from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user_optional
from app.database import get_db
from app.schemas.auth import UserClaims
from app.schemas.discount import ValidateDiscountRequest, ValidateDiscountResponse
from app.services.cart import cart_to_schema, get_or_create_cart
from app.services.discount import validate_discount_for_cart

router = APIRouter(prefix="/discounts", tags=["discounts"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[UserClaims | None, Depends(get_current_user_optional)]


@router.post("/validate", response_model=ValidateDiscountResponse)
async def validate_discount(
    body: ValidateDiscountRequest,
    response: Response,
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
) -> ValidateDiscountResponse:
    """Validate a discount against the server-side cart subtotal (not client-supplied)."""
    cart = await get_or_create_cart(
        db,
        session_id=alankara_cart_session,
        user_id=user.sub if user else None,
        response=response,
    )
    cart_schema = cart_to_schema(cart)
    if not cart_schema.items:
        return ValidateDiscountResponse(valid=False, message="Cart is empty")

    subtotal = cart_schema.subtotal.amount
    category_slugs = list({item.categorySlug for item in cart_schema.items if item.categorySlug})
    product_ids = list({item.productId for item in cart_schema.items})

    try:
        discount, amount = await validate_discount_for_cart(
            db,
            body.code,
            subtotal,
            category_slugs=category_slugs,
            product_ids=product_ids,
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
