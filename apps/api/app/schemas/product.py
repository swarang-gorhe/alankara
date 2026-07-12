from pydantic import BaseModel, Field


class MoneySchema(BaseModel):
    amount: int
    currency: str = "INR"


class ProductVariantSchema(BaseModel):
    id: str
    sku: str
    size: str | None = None
    color: str | None = None
    material: str | None = None
    price: MoneySchema
    stock: int


class ProcessStepSchema(BaseModel):
    title: str
    description: str


class ProductSchema(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    shortDescription: str | None = None
    categoryId: str
    categorySlug: str
    images: list[str] = Field(default_factory=list)
    primaryMaterial: str
    minPrice: int
    materials: list[str] = Field(default_factory=list)
    careInstructions: str | None = None
    featured: bool = False
    occasion: list[str] = Field(default_factory=list)
    process: list[ProcessStepSchema] = Field(default_factory=list)
    relatedSlugs: list[str] = Field(default_factory=list)
    variants: list[ProductVariantSchema] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ProductDetailSchema(ProductSchema):
    relatedProducts: list[ProductSchema] = Field(default_factory=list)


class PaginatedProductsSchema(BaseModel):
    items: list[ProductSchema]
    total: int
    page: int
    page_size: int
    pages: int
