from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, Response, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductVariant
from app.schemas.cart import CartItemDetailSchema, CartSchema
from app.schemas.product import MoneySchema

CART_SESSION_COOKIE = "alankara_cart_session"
CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def _variant_label(variant: ProductVariant) -> str:
    parts = [variant.material, variant.size, variant.color]
    return " · ".join(p for p in parts if p) or variant.sku


def _ensure_session_cookie(response: Response | None, session_id: str | None) -> str:
    if session_id:
        return session_id
    new_session = uuid.uuid4().hex
    if response is not None:
        response.set_cookie(
            key=CART_SESSION_COOKIE,
            value=new_session,
            max_age=CART_COOKIE_MAX_AGE,
            httponly=True,
            samesite="lax",
            path="/",
        )
    return new_session


async def _get_cart_by_session(db: AsyncSession, session_id: str) -> Cart | None:
    stmt = (
        select(Cart)
        .where(Cart.session_id == session_id)
        .options(
            selectinload(Cart.items)
            .selectinload(CartItem.variant)
            .selectinload(ProductVariant.product)
            .selectinload(Product.category),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _get_cart_by_user(db: AsyncSession, user_id: str) -> Cart | None:
    stmt = (
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(
            selectinload(Cart.items)
            .selectinload(CartItem.variant)
            .selectinload(ProductVariant.product)
            .selectinload(Product.category),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _merge_guest_into_user_cart(
    db: AsyncSession,
    guest_cart: Cart,
    user_cart: Cart,
) -> Cart:
    guest_items = {item.product_variant_id: item for item in guest_cart.items}
    user_items = {item.product_variant_id: item for item in user_cart.items}

    for variant_id, guest_item in guest_items.items():
        if variant_id in user_items:
            merged_qty = min(
                user_items[variant_id].quantity + guest_item.quantity,
                guest_item.variant.stock if guest_item.variant else 99,
            )
            user_items[variant_id].quantity = merged_qty
        else:
            user_cart.items.append(
                CartItem(
                    id=_new_id("ci"),
                    cart_id=user_cart.id,
                    product_variant_id=variant_id,
                    quantity=guest_item.quantity,
                )
            )

    await db.delete(guest_cart)
    user_cart.updated_at = datetime.now(UTC)
    await db.flush()
    return user_cart


async def get_or_create_cart(
    db: AsyncSession,
    *,
    session_id: str | None,
    user_id: str | None,
    response: Response | None = None,
) -> Cart:
    session_id = _ensure_session_cookie(response, session_id)
    now = datetime.now(UTC)

    guest_cart = await _get_cart_by_session(db, session_id)
    user_cart = await _get_cart_by_user(db, user_id) if user_id else None

    if user_id and guest_cart and user_cart:
        cart = await _merge_guest_into_user_cart(db, guest_cart, user_cart)
        await db.commit()
        await db.refresh(cart, ["items"])
        for item in cart.items:
            await db.refresh(item, ["variant"])
            if item.variant:
                await db.refresh(item.variant, ["product"])
        return cart

    if user_id and guest_cart and not user_cart:
        guest_cart.user_id = user_id
        guest_cart.session_id = None
        guest_cart.updated_at = now
        await db.commit()
        await db.refresh(guest_cart, ["items"])
        return guest_cart

    if user_cart:
        return user_cart

    if guest_cart:
        return guest_cart

    cart = Cart(
        id=_new_id("cart"),
        session_id=session_id if not user_id else None,
        user_id=user_id,
        created_at=now,
        updated_at=now,
    )
    db.add(cart)
    await db.commit()
    await db.refresh(cart, ["items"])
    return cart


def cart_to_schema(cart: Cart) -> CartSchema:
    items: list[CartItemDetailSchema] = []
    subtotal = 0
    item_count = 0

    for item in cart.items:
        variant = item.variant
        if variant is None:
            continue
        product = variant.product
        if product is None:
            continue

        line_total = variant.price_amount * item.quantity
        subtotal += line_total
        item_count += item.quantity
        images = product.images or []

        items.append(
            CartItemDetailSchema(
                id=item.id,
                productId=product.id,
                productSlug=product.slug,
                productName=product.name,
                variantId=variant.id,
                variantLabel=_variant_label(variant),
                sku=variant.sku,
                quantity=item.quantity,
                unitPrice=MoneySchema(amount=variant.price_amount, currency=variant.price_currency),
                lineTotal=MoneySchema(amount=line_total, currency=variant.price_currency),
                stock=variant.stock,
                image=images[0] if images else None,
                categorySlug=product.category.slug if product.category else None,
            )
        )

    currency = items[0].unitPrice.currency if items else "INR"
    return CartSchema(
        id=cart.id,
        items=items,
        itemCount=item_count,
        subtotal=MoneySchema(amount=subtotal, currency=currency),
        updatedAt=cart.updated_at.isoformat(),
    )


async def add_cart_item(
    db: AsyncSession,
    cart: Cart,
    *,
    variant_id: str,
    quantity: int,
) -> Cart:
    variant_stmt = (
        select(ProductVariant)
        .where(ProductVariant.id == variant_id)
        .options(selectinload(ProductVariant.product))
    )
    variant_result = await db.execute(variant_stmt)
    variant = variant_result.scalar_one_or_none()
    if variant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    if variant.stock < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Variant out of stock")

    existing = next((i for i in cart.items if i.product_variant_id == variant_id), None)
    new_qty = quantity if existing is None else existing.quantity + quantity
    if new_qty > variant.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {variant.stock} in stock",
        )

    if existing:
        existing.quantity = new_qty
    else:
        cart.items.append(
            CartItem(
                id=_new_id("ci"),
                cart_id=cart.id,
                product_variant_id=variant_id,
                quantity=quantity,
            )
        )

    cart.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(cart, ["items"])
    for item in cart.items:
        await db.refresh(item, ["variant"])
        if item.variant:
            await db.refresh(item.variant, ["product"])
    return cart


async def update_cart_item(
    db: AsyncSession,
    cart: Cart,
    *,
    item_id: str,
    quantity: int,
) -> Cart:
    item = next((i for i in cart.items if i.id == item_id), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    await db.refresh(item, ["variant"])
    if item.variant and quantity > item.variant.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {item.variant.stock} in stock",
        )

    item.quantity = quantity
    cart.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(cart, ["items"])
    for cart_item in cart.items:
        await db.refresh(cart_item, ["variant"])
        if cart_item.variant:
            await db.refresh(cart_item.variant, ["product"])
    return cart


async def remove_cart_item(db: AsyncSession, cart: Cart, *, item_id: str) -> Cart:
    item = next((i for i in cart.items if i.id == item_id), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    await db.delete(item)
    cart.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(cart, ["items"])
    return cart


async def clear_cart(db: AsyncSession, cart: Cart) -> None:
    await db.execute(delete(CartItem).where(CartItem.cart_id == cart.id))
    cart.updated_at = datetime.now(UTC)
    await db.commit()
