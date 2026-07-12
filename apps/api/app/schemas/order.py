from pydantic import BaseModel, EmailStr, Field

from app.schemas.product import MoneySchema


class ShippingAddressSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = Field(None, max_length=32)
    line1: str = Field(..., min_length=1, max_length=255)
    line2: str | None = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=128)
    state: str = Field(..., min_length=1, max_length=128)
    postalCode: str = Field(..., min_length=1, max_length=32)
    country: str = Field("IN", min_length=2, max_length=8)


class CheckoutRequest(BaseModel):
    shippingAddress: ShippingAddressSchema
    discountCode: str | None = Field(None, max_length=64)


class OrderItemSchema(BaseModel):
    id: str
    productId: str
    variantId: str
    productName: str
    variantLabel: str | None = None
    sku: str
    quantity: int
    unitPrice: MoneySchema
    lineTotal: MoneySchema


class OrderSchema(BaseModel):
    id: str
    status: str
    email: str
    phone: str | None = None
    items: list[OrderItemSchema]
    subtotal: MoneySchema
    discountCode: str | None = None
    discountAmount: MoneySchema | None = None
    total: MoneySchema
    shippingAddress: ShippingAddressSchema
    createdAt: str


class CheckoutResponse(BaseModel):
    order: OrderSchema
    payment: dict
