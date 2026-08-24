from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user_optional
from app.database import get_db
from app.schemas.auth import UserClaims
from app.schemas.product import ProductSchema
from app.services.recommendations import recommend_products

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[UserClaims | None, Depends(get_current_user_optional)]


class RecommendationsResponse(BaseModel):
    headline: str
    items: list[ProductSchema]


@router.get("", response_model=RecommendationsResponse)
async def get_recommendations(
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
    product_id: str | None = Query(None),
    surface: str = Query("home", pattern="^(home|pdp)$"),
    limit: int = Query(6, ge=1, le=12),
) -> RecommendationsResponse:
    items = await recommend_products(
        db,
        customer_id=user.sub if user else None,
        session_id=alankara_cart_session,
        exclude_product_id=product_id,
        limit=limit,
    )
    headline = "You may also like" if surface == "pdp" else "Picked for you"
    if not user and not alankara_cart_session:
        headline = "New arrivals" if surface == "home" else headline
    return RecommendationsResponse(headline=headline, items=items)
