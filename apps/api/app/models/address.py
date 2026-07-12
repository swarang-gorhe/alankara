from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    line1: Mapped[str] = mapped_column(String(255))
    line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(128))
    state: Mapped[str] = mapped_column(String(128))
    postal_code: Mapped[str] = mapped_column(String(32))
    country: Mapped[str] = mapped_column(String(8), default="IN")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
