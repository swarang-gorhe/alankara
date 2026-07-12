from abc import ABC, abstractmethod
from pathlib import Path
from uuid import uuid4

from app.config import get_settings


class StorageBackend(ABC):
    @abstractmethod
    def save(self, filename: str, data: bytes, content_type: str | None = None) -> str:
        """Persist file bytes and return a storage key or path."""

    @abstractmethod
    def get_url(self, key: str) -> str:
        """Return a URL or path for serving the stored object."""


class LocalStorageBackend(StorageBackend):
    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save(self, filename: str, data: bytes, content_type: str | None = None) -> str:
        safe_name = filename.replace("/", "_").replace("\\", "_")
        key = f"{uuid4().hex}_{safe_name}"
        path = self.base_dir / key
        path.write_bytes(data)
        return key

    def get_url(self, key: str) -> str:
        return f"/uploads/{key}"


def get_storage_backend() -> StorageBackend:
    settings = get_settings()
    if settings.storage_backend == "local":
        return LocalStorageBackend(settings.upload_path)
    raise NotImplementedError(
        f"Storage backend '{settings.storage_backend}' is not implemented yet (Phase 8: supabase)"
    )
