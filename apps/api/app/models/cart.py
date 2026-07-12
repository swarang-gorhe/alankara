from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    session_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, nullable=True
    )
    user_id: Mapped[str | None] = mapped_column(String(64), unique=True, index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart",
        cascade="all, delete-orphan",
    )


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("cart_id", "product_variant_id", name="uq_cart_variant"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    cart_id: Mapped[str] = mapped_column(ForeignKey("carts.id", ondelete="CASCADE"), index=True)
    product_variant_id: Mapped[str] = mapped_column(ForeignKey("product_variants.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    cart: Mapped["Cart"] = relationship(back_populates="items")
    variant: Mapped["ProductVariant"] = relationship()


from app.models.product import ProductVariant  # noqa: E402
