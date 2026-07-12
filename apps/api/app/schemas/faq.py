from pydantic import BaseModel, Field


class FaqEntrySchema(BaseModel):
    id: str
    slug: str
    question: str
    answer: str
    category: str
    sortOrder: int
    published: bool
    createdAt: str
    updatedAt: str


class FaqEntryCreateSchema(BaseModel):
    slug: str = Field(..., min_length=2, max_length=128)
    question: str = Field(..., min_length=1)
    answer: str = Field(..., min_length=1)
    category: str = Field("general", max_length=64)
    sortOrder: int = 0
    published: bool = True


class FaqEntryUpdateSchema(BaseModel):
    slug: str | None = Field(None, min_length=2, max_length=128)
    question: str | None = Field(None, min_length=1)
    answer: str | None = Field(None, min_length=1)
    category: str | None = Field(None, max_length=64)
    sortOrder: int | None = None
    published: bool | None = None


class PaginatedFaqSchema(BaseModel):
    items: list[FaqEntrySchema]
    total: int
    page: int
    page_size: int
    pages: int
