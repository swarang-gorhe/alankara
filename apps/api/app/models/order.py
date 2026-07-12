from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    subtotal_amount: Mapped[int] = mapped_column(Integer)
    total_amount: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(8), default="INR")
    shipping_address: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(String(64))
    variant_id: Mapped[str] = mapped_column(String(64))
    product_name: Mapped[str] = mapped_column(String(255))
    variant_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sku: Mapped[str] = mapped_column(String(64))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price_amount: Mapped[int] = mapped_column(Integer)
    unit_price_currency: Mapped[str] = mapped_column(String(8))
    line_total_amount: Mapped[int] = mapped_column(Integer)

    order: Mapped["Order"] = relationship(back_populates="items")
