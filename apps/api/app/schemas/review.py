from datetime import datetime

from pydantic import BaseModel


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


class PaginatedReviewsSchema(BaseModel):
    items: list[ReviewSchema]
    total: int
    page: int
    page_size: int
    pages: int
