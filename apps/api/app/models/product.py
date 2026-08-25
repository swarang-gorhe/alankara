from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    short_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"), index=True)
    primary_material: Mapped[str] = mapped_column(String(64), index=True)
    min_price: Mapped[int] = mapped_column(Integer)
    materials: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    care_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    occasion: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    process: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    related_slugs: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    images: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="published", index=True)
    tags: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    ai_generated_tags: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    try_on_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    try_on_type: Mapped[str] = mapped_column(String(32), default="earring")
    try_on_asset_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    try_on_scale: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("1.0"))
    try_on_left_offset_x: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0"))
    try_on_left_offset_y: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0"))
    try_on_right_offset_x: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0"))
    try_on_right_offset_y: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0"))
    try_on_rotation: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0"))
    try_on_vertical_offset: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0"))
    try_on_necklace_asset_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    try_on_necklace_length_offset: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), default=Decimal("0")
    )
    try_on_necklace_scale: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("1.0"))
    try_on_necklace_rotation_offset: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), default=Decimal("0")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    category: Mapped["Category"] = relationship(back_populates="products")
    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )
    reviews: Mapped[list["Review"]] = relationship(back_populates="product")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    product_id: Mapped[str] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    sku: Mapped[str] = mapped_column(String(64), unique=True)
    size: Mapped[str | None] = mapped_column(String(64), nullable=True)
    color: Mapped[str | None] = mapped_column(String(64), nullable=True)
    material: Mapped[str | None] = mapped_column(String(128), nullable=True)
    price_amount: Mapped[int] = mapped_column(Integer)
    price_currency: Mapped[str] = mapped_column(String(8), default="INR")
    stock: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="variants")


from app.models.category import Category  # noqa: E402
from app.models.review import Review  # noqa: E402
