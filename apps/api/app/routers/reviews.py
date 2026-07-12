import math
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.review import Review
from app.schemas.ai import AIInsightsSchema
from app.schemas.review import PaginatedReviewsSchema, ReviewSchema
from app.services.ai.chains.insights_chain import get_global_insights

router = APIRouter(prefix="/reviews", tags=["reviews"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=PaginatedReviewsSchema)
async def list_reviews(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: str | None = None,
    category: str | None = None,
    approved_only: bool = True,
) -> PaginatedReviewsSchema:
    stmt = select(Review).options(selectinload(Review.product).selectinload(Product.category))

    if approved_only:
        stmt = stmt.where(Review.approved.is_(True))
    if product_id:
        stmt = stmt.where(Review.product_id == product_id)
    if category:
        stmt = (
            stmt.join(Review.product)
            .join(Product.category)
            .where(Category.slug == category)
        )

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    offset = (page - 1) * page_size
    result = await db.execute(
        stmt.order_by(Review.created_at.desc()).offset(offset).limit(page_size)
    )
    reviews = result.scalars().unique().all()

    items = [
        ReviewSchema(
            id=r.id,
            productId=r.product_id,
            productSlug=r.product.slug,
            productName=r.product.name,
            categorySlug=r.product.category.slug if r.product.category else "",
            userId=r.user_id,
            authorName=r.author_name,
            rating=r.rating,
            text=r.text,
            createdAt=r.created_at,
            approved=r.approved,
        )
        for r in reviews
    ]

    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedReviewsSchema(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/insights", response_model=AIInsightsSchema)
async def review_insights(db: DbSession) -> AIInsightsSchema:
    data = await get_global_insights(db)
    return AIInsightsSchema(**data)
