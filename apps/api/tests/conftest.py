import asyncio
import os
import subprocess
from collections.abc import Generator

# Must be set before app.database is imported so the engine uses NullPool.
os.environ["TESTING"] = "1"

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def database_url() -> str:
    return os.environ.get(
        "DATABASE_URL",
        "postgresql://alankara:alankara_dev@localhost:5432/alankara_test",
    )


@pytest.fixture(scope="session")
def seeded_database(database_url: str) -> Generator[None, None, None]:
    os.environ["DATABASE_URL"] = database_url
    os.environ["TESTING"] = "1"

    from app.config import get_settings

    get_settings.cache_clear()

    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
    from sqlalchemy.pool import NullPool

    import app.database as database

    # Recreate the engine against the test DATABASE_URL with NullPool. The module
    # engine may have been created at import with a different URL/pool.
    asyncio.run(database.engine.dispose())
    database.engine = create_async_engine(
        database.async_database_url(database_url),
        echo=False,
        poolclass=NullPool,
    )
    database.async_session_maker = async_sessionmaker(
        database.engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    api_root = os.path.dirname(os.path.dirname(__file__))
    alembic_bin = os.path.join(api_root, ".venv", "bin", "alembic")
    if not os.path.isfile(alembic_bin):
        alembic_bin = "alembic"

    result = subprocess.run(
        [alembic_bin, "upgrade", "head"],
        cwd=api_root,
        env={**os.environ, "DATABASE_URL": database_url},
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        pytest.skip(f"Database not available for integration tests: {result.stderr}")

    from scripts.seed import run_seed

    asyncio.run(run_seed(force=True))
    # Drop any connections opened on the seed loop before TestClient starts.
    asyncio.run(database.engine.dispose())

    yield

    asyncio.run(database.engine.dispose())


@pytest.fixture
def client(seeded_database: None) -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin_headers(client):
    login = client.post(
        "/auth/login",
        json={"email": "admin@alankara.local", "password": "admin-dev-only"},
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
