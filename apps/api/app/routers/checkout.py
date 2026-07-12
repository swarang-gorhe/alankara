from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user_optional
from app.database import get_db
from app.models.address import Address
from app.models.order import Order, OrderItem
from app.schemas.auth import UserClaims
from app.schemas.order import CheckoutRequest, CheckoutResponse, OrderItemSchema, OrderSchema
from app.schemas.product import MoneySchema
from app.services.cart import (
    cart_to_schema,
    clear_cart,
    get_or_create_cart,
)
from app.services.payment import get_payment_provider

router = APIRouter(tags=["checkout"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[UserClaims | None, Depends(get_current_user_optional)]


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    body: CheckoutRequest,
    response: Response,
    db: DbSession,
    user: OptionalUser,
    alankara_cart_session: str | None = Cookie(None),
) -> CheckoutResponse:
    cart = await get_or_create_cart(
        db,
        session_id=alankara_cart_session,
        user_id=user.sub if user else None,
        response=response,
    )
    cart_schema = cart_to_schema(cart)

    if not cart_schema.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    for item in cart_schema.items:
        if item.quantity > item.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{item.productName} has only {item.stock} in stock",
            )

    now = datetime.now(UTC)
    order_id = _new_id("ord")
    addr = body.shippingAddress

    order = Order(
        id=order_id,
        user_id=user.sub if user else None,
        session_id=alankara_cart_session,
        status="pending_payment",
        email=addr.email,
        phone=addr.phone,
        subtotal_amount=cart_schema.subtotal.amount,
        total_amount=cart_schema.subtotal.amount,
        currency=cart_schema.subtotal.currency,
        shipping_address=addr.model_dump(),
        created_at=now,
        updated_at=now,
    )

    order_items: list[OrderItem] = []
    for item in cart_schema.items:
        order_items.append(
            OrderItem(
                id=_new_id("oi"),
                order_id=order_id,
                product_id=item.productId,
                variant_id=item.variantId,
                product_name=item.productName,
                variant_label=item.variantLabel,
                sku=item.sku,
                quantity=item.quantity,
                unit_price_amount=item.unitPrice.amount,
                unit_price_currency=item.unitPrice.currency,
                line_total_amount=item.lineTotal.amount,
            )
        )
    order.items = order_items
    db.add(order)

    if user:
        db.add(
            Address(
                id=_new_id("addr"),
                user_id=user.sub,
                name=addr.name,
                email=addr.email,
                phone=addr.phone,
                line1=addr.line1,
                line2=addr.line2,
                city=addr.city,
                state=addr.state,
                postal_code=addr.postalCode,
                country=addr.country,
                created_at=now,
            )
        )

    await db.commit()
    await clear_cart(db, cart)

    payment_provider = get_payment_provider()
    payment = await payment_provider.create_payment_session(
        order_id=order_id,
        amount=order.total_amount,
        currency=order.currency,
        customer_email=addr.email,
    )

    order_schema = OrderSchema(
        id=order.id,
        status=order.status,
        email=order.email,
        phone=order.phone,
        items=[
            OrderItemSchema(
                id=oi.id,
                productId=oi.product_id,
                variantId=oi.variant_id,
                productName=oi.product_name,
                variantLabel=oi.variant_label,
                sku=oi.sku,
                quantity=oi.quantity,
                unitPrice=MoneySchema(amount=oi.unit_price_amount, currency=oi.unit_price_currency),
                lineTotal=MoneySchema(amount=oi.line_total_amount, currency=oi.unit_price_currency),
            )
            for oi in order_items
        ],
        subtotal=MoneySchema(amount=order.subtotal_amount, currency=order.currency),
        total=MoneySchema(amount=order.total_amount, currency=order.currency),
        shippingAddress=addr,
        createdAt=order.created_at.isoformat(),
    )

    return CheckoutResponse(order=order_schema, payment=payment)
