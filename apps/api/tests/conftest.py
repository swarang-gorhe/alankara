import asyncio
import os
import subprocess
from collections.abc import Generator

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

    from app.config import get_settings

    get_settings.cache_clear()

    from app.database import engine

    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd=os.path.dirname(os.path.dirname(__file__)),
        env={**os.environ, "DATABASE_URL": database_url},
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        pytest.skip(f"Database not available for integration tests: {result.stderr}")

    from scripts.seed import run_seed

    asyncio.run(run_seed(force=True))

    yield

    asyncio.run(engine.dispose())


@pytest.fixture
def client(seeded_database: None) -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client
