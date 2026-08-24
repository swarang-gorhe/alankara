import math
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import get_current_user_optional
from app.database import get_db
from app.models.category import Category
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.review import Review
from app.schemas.ai import AIInsightsSchema
from app.schemas.auth import UserClaims
from app.schemas.mappers import review_to_public_schema, review_to_schema
from app.schemas.review import PaginatedPublicReviewsSchema, ReviewSchema
from app.services.ai.chains.insights_chain import get_global_insights
from app.services.events import log_event

router = APIRouter(prefix="/reviews", tags=["reviews"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[UserClaims | None, Depends(get_current_user_optional)]


class ReviewCreate(BaseModel):
    productId: str = Field(min_length=1)
    rating: int = Field(ge=1, le=5)
    title: str | None = Field(None, max_length=255)
    text: str = Field(min_length=10, max_length=2000)
    authorName: str | None = Field(None, max_length=128)
    authorEmail: str | None = Field(None, max_length=255)


async def _is_verified_purchase(
    db: AsyncSession, product_id: str, *, user_id: str | None, email: str | None
) -> bool:
    conditions = [OrderItem.product_id == product_id, Order.payment_status == "paid"]
    identity = []
    if user_id:
        identity.append(Order.user_id == user_id)
    if email:
        identity.append(Order.email == email)
    if not identity:
        return False
    stmt = (
        select(OrderItem.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(*conditions, or_(*identity))
        .limit(1)
    )
    return (await db.execute(stmt)).scalar_one_or_none() is not None


@router.get("", response_model=PaginatedPublicReviewsSchema)
async def list_reviews(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    product_id: str | None = None,
    category: str | None = None,
    sort: str | None = Query("newest", pattern="^(newest|highest|lowest)$"),
) -> PaginatedPublicReviewsSchema:
    stmt = (
        select(Review)
        .options(selectinload(Review.product).selectinload(Product.category))
        .where(Review.approved.is_(True))
    )
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

    order = Review.created_at.desc()
    if sort == "highest":
        order = Review.rating.desc()
    elif sort == "lowest":
        order = Review.rating.asc()

    offset = (page - 1) * page_size
    result = await db.execute(stmt.order_by(order).offset(offset).limit(page_size))
    reviews = result.scalars().unique().all()

    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedPublicReviewsSchema(
        items=[review_to_public_schema(r) for r in reviews],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/insights", response_model=AIInsightsSchema)
async def review_insights(db: DbSession) -> AIInsightsSchema:
    data = await get_global_insights(db)
    return AIInsightsSchema(**data)


@router.post("", response_model=ReviewSchema, status_code=status.HTTP_201_CREATED)
async def submit_review(
    body: ReviewCreate, db: DbSession, user: OptionalUser
) -> ReviewSchema:
    if user is None and not body.authorEmail:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in or provide an email to leave a review",
        )

    product = await db.get(Product, body.productId)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    email = (user.email if user else body.authorEmail) or None
    author_name = body.authorName
    if not author_name and user:
        author_name = user.email.split("@")[0]
    if not author_name and email:
        author_name = email.split("@")[0]

    verified = await _is_verified_purchase(
        db, body.productId, user_id=user.sub if user else None, email=email
    )

    review = Review(
        id=f"rev-{uuid.uuid4().hex[:12]}",
        product_id=body.productId,
        user_id=user.sub if user else None,
        author_name=author_name or "Guest",
        customer_email=email,
        rating=body.rating,
        title=body.title,
        text=body.text,
        created_at=datetime.now(UTC),
        approved=False,
        verified_purchase=verified,
        status="pending",
    )
    db.add(review)
    await log_event(
        db,
        product_id=body.productId,
        event_type="reviewed",
        customer_id=user.sub if user else None,
    )
    await db.commit()

    result = await db.execute(
        select(Review)
        .options(selectinload(Review.product).selectinload(Product.category))
        .where(Review.id == review.id)
    )
    review = result.scalar_one()
    return review_to_schema(review)
