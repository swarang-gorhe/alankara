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
from app.services.discount import validate_discount_for_cart
from app.services.email import send_order_confirmation
from app.services.events import log_event
from app.services.payment import get_payment_provider
from app.services.stock import InsufficientStockError, restore_stock, reserve_stock

router = APIRouter(tags=["checkout"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[UserClaims | None, Depends(get_current_user_optional)]


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def order_to_schema(order: Order) -> OrderSchema:
    currency = order.currency
    addr = order.shipping_address or {}
    from app.schemas.order import ShippingAddressSchema

    return OrderSchema(
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
            for oi in order.items
        ],
        subtotal=MoneySchema(amount=order.subtotal_amount, currency=currency),
        discountCode=order.discount_code,
        discountAmount=MoneySchema(amount=order.discount_amount, currency=currency)
        if order.discount_amount
        else None,
        total=MoneySchema(amount=order.total_amount, currency=currency),
        shippingAddress=ShippingAddressSchema.model_validate(addr),
        paymentStatus=order.payment_status,
        createdAt=order.created_at.isoformat(),
    )


async def mark_order_paid(db: AsyncSession, order: Order) -> None:
    if order.payment_status == "paid":
        return
    order.payment_status = "paid"
    if order.status == "pending_payment":
        order.status = "paid"
    order.updated_at = datetime.now(UTC)
    for item in order.items:
        await log_event(
            db,
            product_id=item.product_id,
            event_type="purchased",
            customer_id=order.user_id,
            session_id=order.session_id,
        )
    await db.commit()
    await db.refresh(order, ["items"])
    try:
        await send_order_confirmation(order)
    except Exception:  # noqa: BLE001
        pass


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

    subtotal = cart_schema.subtotal.amount
    discount_code: str | None = None
    discount_amount = 0
    applied_discount = None

    if body.discountCode:
        category_slugs = list(
            {item.categorySlug for item in cart_schema.items if item.categorySlug}
        )
        product_ids = list({item.productId for item in cart_schema.items})
        applied_discount, discount_amount = await validate_discount_for_cart(
            db,
            body.discountCode,
            subtotal,
            category_slugs=category_slugs,
            product_ids=product_ids,
        )
        discount_code = applied_discount.code

    total_amount = subtotal - discount_amount

    now = datetime.now(UTC)
    order_id = _new_id("ord")
    addr = body.shippingAddress
    reservations = [(item.variantId, item.quantity) for item in cart_schema.items]

    try:
        await reserve_stock(db, reservations)
    except InsufficientStockError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    order = Order(
        id=order_id,
        user_id=user.sub if user else None,
        session_id=alankara_cart_session,
        status="pending_payment",
        email=addr.email,
        phone=addr.phone,
        subtotal_amount=subtotal,
        discount_code=discount_code,
        discount_amount=discount_amount,
        total_amount=total_amount,
        currency=cart_schema.subtotal.currency,
        shipping_amount=0,
        shipping_address=addr.model_dump(),
        payment_status="pending",
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

    if applied_discount is not None:
        applied_discount.usage_count += 1

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

    await db.flush()

    payment_provider = get_payment_provider()
    payment = await payment_provider.create_payment_session(
        order_id=order_id,
        amount=order.total_amount,
        currency=order.currency,
        customer_email=addr.email,
    )

    if payment.get("status") == "failed":
        await restore_stock(db, reservations)
        order.status = "cancelled"
        order.payment_status = "failed"
        await db.commit()
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=payment.get("message"))

    if payment.get("paymentIntentId"):
        order.payment_intent_id = payment["paymentIntentId"]

    await db.commit()
    await clear_cart(db, cart)

    if payment.get("status") == "succeeded":
        await db.refresh(order, ["items"])
        await mark_order_paid(db, order)
        payment["message"] = payment.get("message") or "Payment received. A confirmation is on its way."

    await db.refresh(order, ["items"])
    return CheckoutResponse(order=order_to_schema(order), payment=payment)
