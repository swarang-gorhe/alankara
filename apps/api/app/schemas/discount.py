from pydantic import BaseModel, Field


class DiscountConditionsSchema(BaseModel):
    minOrderAmount: int | None = None
    categorySlugs: list[str] = Field(default_factory=list)
    productIds: list[str] = Field(default_factory=list)


class DiscountSchema(BaseModel):
    id: str
    code: str
    type: str
    value: int
    conditions: DiscountConditionsSchema | None = None
    expiresAt: str | None = None
    usageLimit: int | None = None
    usageCount: int
    active: bool
    createdAt: str
    updatedAt: str


class DiscountCreateSchema(BaseModel):
    code: str = Field(..., min_length=2, max_length=64)
    type: str = Field(..., pattern="^(percentage|flat)$")
    value: int = Field(..., gt=0)
    conditions: DiscountConditionsSchema | None = None
    expiresAt: str | None = None
    usageLimit: int | None = Field(None, ge=1)
    active: bool = True


class DiscountUpdateSchema(BaseModel):
    code: str | None = Field(None, min_length=2, max_length=64)
    type: str | None = Field(None, pattern="^(percentage|flat)$")
    value: int | None = Field(None, gt=0)
    conditions: DiscountConditionsSchema | None = None
    expiresAt: str | None = None
    usageLimit: int | None = Field(None, ge=1)
    active: bool | None = None


class PaginatedDiscountsSchema(BaseModel):
    items: list[DiscountSchema]
    total: int
    page: int
    page_size: int
    pages: int


class ValidateDiscountRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=64)
    subtotalAmount: int = Field(..., ge=0)


class ValidateDiscountResponse(BaseModel):
    valid: bool
    code: str | None = None
    discountAmount: int = 0
    message: str | None = None
