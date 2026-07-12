import math
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.schemas.admin import AdminReviewModerationSchema
from app.schemas.auth import UserClaims
from app.schemas.review import PaginatedReviewsSchema, ReviewSchema

router = APIRouter(prefix="/admin/reviews", tags=["admin-reviews"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


@router.get("", response_model=PaginatedReviewsSchema)
async def list_admin_reviews(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: str | None = None,
    approved: bool | None = None,
) -> PaginatedReviewsSchema:
    stmt = select(Review).options(selectinload(Review.product).selectinload(Product.category))

    if product_id:
        stmt = stmt.where(Review.product_id == product_id)
    if approved is not None:
        stmt = stmt.where(Review.approved.is_(approved))

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    offset = (page - 1) * page_size
    result = await db.execute(
        stmt.order_by(Review.created_at.desc()).offset(offset).limit(page_size)
    )
    reviews = result.scalars().unique().all()
    pages = max(1, math.ceil(total / page_size)) if total else 1

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
    return PaginatedReviewsSchema(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.patch("/{review_id}", response_model=ReviewSchema)
async def moderate_review(
    review_id: str,
    body: AdminReviewModerationSchema,
    db: DbSession,
    _admin: AdminUser,
) -> ReviewSchema:
    result = await db.execute(
        select(Review)
        .where(Review.id == review_id)
        .options(selectinload(Review.product).selectinload(Product.category))
    )
    review = result.scalar_one_or_none()
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    review.approved = body.approved
    await db.commit()
    await db.refresh(review, ["product"])

    return ReviewSchema(
        id=review.id,
        productId=review.product_id,
        productSlug=review.product.slug,
        productName=review.product.name,
        categorySlug=review.product.category.slug if review.product.category else "",
        userId=review.user_id,
        authorName=review.author_name,
        rating=review.rating,
        text=review.text,
        createdAt=review.created_at,
        approved=review.approved,
    )
