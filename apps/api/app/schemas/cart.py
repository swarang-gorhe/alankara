from pydantic import BaseModel, Field

from app.schemas.product import MoneySchema


class AddCartItemRequest(BaseModel):
    variantId: str
    quantity: int = Field(1, ge=1, le=99)


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=1, le=99)


class CartItemDetailSchema(BaseModel):
    id: str
    productId: str
    productSlug: str
    productName: str
    variantId: str
    variantLabel: str
    sku: str
    quantity: int
    unitPrice: MoneySchema
    lineTotal: MoneySchema
    stock: int
    image: str | None = None
    categorySlug: str | None = None


class CartSchema(BaseModel):
    id: str
    items: list[CartItemDetailSchema] = Field(default_factory=list)
    itemCount: int
    subtotal: MoneySchema
    updatedAt: str
