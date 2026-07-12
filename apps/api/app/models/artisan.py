from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Artisan(Base):
    __tablename__ = "artisans"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255))
    bio: Mapped[str] = mapped_column(Text)
    specialty: Mapped[list] = mapped_column(JSONB)
    years_experience: Mapped[int] = mapped_column(Integer)
    quote: Mapped[str] = mapped_column(Text)
