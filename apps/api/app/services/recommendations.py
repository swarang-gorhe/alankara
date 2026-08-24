"""Rule-based catalog recommendations from CustomerEvent overlap."""

from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.customer_event import CustomerEvent
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.mappers import product_to_schema
from app.schemas.product import ProductSchema

EVENT_WEIGHTS = {
    "viewed": 1.0,
    "added_to_cart": 3.0,
    "reviewed": 4.0,
    "purchased": 5.0,
}
HALF_LIFE_DAYS = 14.0
RECENCY_WINDOW = timedelta(days=90)


def _recency_weight(created_at: datetime, now: datetime) -> float:
    age_days = max((now - created_at).total_seconds() / 86400.0, 0.0)
    return 0.5 ** (age_days / HALF_LIFE_DAYS)


async def _published_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(
        select(Product)
        .where(Product.status == "published")
        .options(selectinload(Product.variants), selectinload(Product.category))
    )
    return list(result.scalars().unique().all())


async def _fallback_products(db: AsyncSession, *, exclude: set[str], limit: int) -> list[Product]:
    sold = (
        select(OrderItem.product_id, func.sum(OrderItem.quantity).label("qty"))
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.payment_status == "paid")
        .group_by(OrderItem.product_id)
        .subquery()
    )
    result = await db.execute(
        select(Product)
        .outerjoin(sold, sold.c.product_id == Product.id)
        .where(Product.status == "published")
        .options(selectinload(Product.variants), selectinload(Product.category))
        .order_by(
            func.coalesce(sold.c.qty, 0).desc(),
            Product.featured.desc(),
            Product.created_at.desc(),
        )
    )
    products = [p for p in result.scalars().unique().all() if p.id not in exclude]
    if len(products) < limit:
        extra = await _published_products(db)
        seen = {p.id for p in products} | exclude
        for product in extra:
            if product.id not in seen:
                products.append(product)
                seen.add(product.id)
            if len(products) >= limit:
                break
    return products[:limit]


async def recommend_products(
    db: AsyncSession,
    *,
    customer_id: str | None,
    session_id: str | None,
    exclude_product_id: str | None = None,
    limit: int = 6,
) -> list[ProductSchema]:
    now = datetime.now(UTC)
    exclude: set[str] = {exclude_product_id} if exclude_product_id else set()

    identity_filters = []
    if customer_id:
        identity_filters.append(CustomerEvent.customer_id == customer_id)
    if session_id:
        identity_filters.append(CustomerEvent.session_id == session_id)

    events: list[CustomerEvent] = []
    if identity_filters:
        from sqlalchemy import or_

        result = await db.execute(
            select(CustomerEvent).where(
                or_(*identity_filters),
                CustomerEvent.created_at >= now - RECENCY_WINDOW,
            )
        )
        events = list(result.scalars().all())

    if not events:
        fallback = await _fallback_products(db, exclude=exclude, limit=limit)
        return [product_to_schema(p) for p in fallback]

    catalog = await _published_products(db)
    by_id = {p.id: p for p in catalog}

    seed_scores: dict[str, float] = defaultdict(float)
    for event in events:
        if event.product_id in exclude:
            continue
        seed_scores[event.product_id] += EVENT_WEIGHTS.get(event.event_type, 1.0) * _recency_weight(
            event.created_at, now
        )

    seed_products = [by_id[pid] for pid in seed_scores if pid in by_id]
    if not seed_products:
        fallback = await _fallback_products(db, exclude=exclude, limit=limit)
        return [product_to_schema(p) for p in fallback]

    seed_categories = {p.category_id for p in seed_products}
    seed_tags: set[str] = set()
    for product in seed_products:
        for tag in (product.tags or []) + (product.ai_generated_tags or []):
            seed_tags.add(str(tag).lower())
        seed_tags.add(product.primary_material.lower())

    ranked: list[tuple[float, Product]] = []
    for product in catalog:
        if product.id in exclude or product.id in seed_scores:
            continue
        score = 0.0
        if product.category_id in seed_categories:
            score += 4.0
        tags = (product.tags or []) + (product.ai_generated_tags or [])
        product_tags = {str(t).lower() for t in tags}
        product_tags.add(product.primary_material.lower())
        overlap = seed_tags & product_tags
        score += 2.0 * len(overlap)
        if product.featured:
            score += 1.0
        if score > 0:
            ranked.append((score, product))

    ranked.sort(key=lambda pair: pair[0], reverse=True)
    selected = [p for _, p in ranked[:limit]]
    if len(selected) < limit:
        filler = await _fallback_products(
            db, exclude=exclude | {p.id for p in selected}, limit=limit
        )
        seen = {p.id for p in selected}
        for product in filler:
            if product.id not in seen:
                selected.append(product)
                seen.add(product.id)
            if len(selected) >= limit:
                break
    return [product_to_schema(p) for p in selected[:limit]]
