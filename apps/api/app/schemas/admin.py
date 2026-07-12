from pydantic import BaseModel, Field

from app.schemas.product import MoneySchema, ProductSchema


class DashboardStatsSchema(BaseModel):
    revenue: MoneySchema
    ordersCount: int
    pendingOrdersCount: int
    lowStockAlerts: list[dict]


class AdminProductCreateSchema(BaseModel):
    slug: str = Field(..., min_length=2, max_length=128)
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    shortDescription: str | None = None
    categoryId: str
    primaryMaterial: str
    minPrice: int = Field(..., ge=0)
    materials: list[str] = Field(default_factory=list)
    careInstructions: str | None = None
    featured: bool = False
    occasion: list[str] = Field(default_factory=list)
    relatedSlugs: list[str] = Field(default_factory=list)
    images: list[str] = Field(default_factory=list)


class AdminProductUpdateSchema(BaseModel):
    slug: str | None = Field(None, min_length=2, max_length=128)
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=1)
    shortDescription: str | None = None
    categoryId: str | None = None
    primaryMaterial: str | None = None
    minPrice: int | None = Field(None, ge=0)
    materials: list[str] | None = None
    careInstructions: str | None = None
    featured: bool | None = None
    occasion: list[str] | None = None
    relatedSlugs: list[str] | None = None
    images: list[str] | None = None


class AdminVariantCreateSchema(BaseModel):
    sku: str = Field(..., min_length=1, max_length=64)
    size: str | None = None
    color: str | None = None
    material: str | None = None
    priceAmount: int = Field(..., ge=0)
    priceCurrency: str = "INR"
    stock: int = Field(0, ge=0)


class AdminVariantUpdateSchema(BaseModel):
    sku: str | None = Field(None, min_length=1, max_length=64)
    size: str | None = None
    color: str | None = None
    material: str | None = None
    priceAmount: int | None = Field(None, ge=0)
    priceCurrency: str | None = None
    stock: int | None = Field(None, ge=0)


class AdminOrderItemSchema(BaseModel):
    id: str
    productId: str
    variantId: str
    productName: str
    variantLabel: str | None = None
    sku: str
    quantity: int
    unitPrice: MoneySchema
    lineTotal: MoneySchema


class AdminOrderSchema(BaseModel):
    id: str
    status: str
    email: str
    phone: str | None = None
    items: list[AdminOrderItemSchema]
    subtotal: MoneySchema
    discountCode: str | None = None
    discountAmount: MoneySchema
    total: MoneySchema
    shippingAddress: dict
    fulfillmentNotes: str | None = None
    createdAt: str
    updatedAt: str


class AdminOrderUpdateSchema(BaseModel):
    status: str | None = Field(
        None,
        pattern="^(pending_payment|paid|processing|shipped|delivered|cancelled)$",
    )
    fulfillmentNotes: str | None = None


class PaginatedAdminOrdersSchema(BaseModel):
    items: list[AdminOrderSchema]
    total: int
    page: int
    page_size: int
    pages: int


class PaginatedAdminProductsSchema(BaseModel):
    items: list[ProductSchema]
    total: int
    page: int
    page_size: int
    pages: int


class AdminReviewModerationSchema(BaseModel):
    approved: bool
