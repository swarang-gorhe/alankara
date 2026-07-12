from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user_optional
from app.database import get_db
from app.schemas.auth import UserClaims
from app.schemas.cart import AddCartItemRequest, CartSchema, UpdateCartItemRequest
from app.services.cart import (
    add_cart_item,
    cart_to_schema,
    get_or_create_cart,
    remove_cart_item,
    update_cart_item,
)

router = APIRouter(prefix="/cart", tags=["cart"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[UserClaims | None, Depends(get_current_user_optional)]


@router.get("", response_model=CartSchema)
async def get_cart(
    response: Response,
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
) -> CartSchema:
    cart = await get_or_create_cart(
        db,
        session_id=alankara_cart_session,
        user_id=user.sub if user else None,
        response=response,
    )
    return cart_to_schema(cart)


@router.post("/items", response_model=CartSchema)
async def post_cart_item(
    body: AddCartItemRequest,
    response: Response,
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
) -> CartSchema:
    cart = await get_or_create_cart(
        db,
        session_id=alankara_cart_session,
        user_id=user.sub if user else None,
        response=response,
    )
    cart = await add_cart_item(db, cart, variant_id=body.variantId, quantity=body.quantity)
    return cart_to_schema(cart)


@router.patch("/items/{item_id}", response_model=CartSchema)
async def patch_cart_item(
    item_id: str,
    body: UpdateCartItemRequest,
    response: Response,
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
) -> CartSchema:
    cart = await get_or_create_cart(
        db,
        session_id=alankara_cart_session,
        user_id=user.sub if user else None,
        response=response,
    )
    cart = await update_cart_item(db, cart, item_id=item_id, quantity=body.quantity)
    return cart_to_schema(cart)


@router.delete("/items/{item_id}", response_model=CartSchema)
async def delete_cart_item(
    item_id: str,
    response: Response,
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
) -> CartSchema:
    cart = await get_or_create_cart(
        db,
        session_id=alankara_cart_session,
        user_id=user.sub if user else None,
        response=response,
    )
    cart = await remove_cart_item(db, cart, item_id=item_id)
    return cart_to_schema(cart)
