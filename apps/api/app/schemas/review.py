from datetime import datetime

from pydantic import BaseModel


class PublicReviewSchema(BaseModel):
    """Public review listing — omits internal user IDs and moderation flags."""

    id: str
    productId: str
    productSlug: str
    productName: str
    categorySlug: str
    authorName: str
    rating: int
    text: str
    createdAt: datetime

    model_config = {"from_attributes": True}


class ReviewSchema(BaseModel):
    id: str
    productId: str
    productSlug: str
    productName: str
    categorySlug: str
    userId: str | None = None
    authorName: str
    rating: int
    text: str
    createdAt: datetime
    approved: bool

    model_config = {"from_attributes": True}


class PaginatedPublicReviewsSchema(BaseModel):
    items: list[PublicReviewSchema]
    total: int
    page: int
    page_size: int
    pages: int


class PaginatedReviewsSchema(BaseModel):
    items: list[ReviewSchema]
    total: int
    page: int
    page_size: int
    pages: int
