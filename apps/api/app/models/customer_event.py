from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CustomerEvent(Base):
    __tablename__ = "customer_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    customer_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    session_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(32), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
