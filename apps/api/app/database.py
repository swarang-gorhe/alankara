import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import get_settings


def async_database_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


class Base(DeclarativeBase):
    pass


def _engine_kwargs() -> dict:
    # Pytest creates a new event loop per TestClient; pooled asyncpg connections
    # cannot move between loops. NullPool avoids cross-test reuse.
    if os.environ.get("TESTING") == "1":
        return {"poolclass": NullPool}
    return {}


settings = get_settings()
engine = create_async_engine(
    async_database_url(settings.database_url),
    echo=False,
    **_engine_kwargs(),
)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
