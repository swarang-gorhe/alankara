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


class SupabaseStorageBackend(StorageBackend):
    """Supabase Storage scaffold — wire HTTP upload when credentials are configured.

  Set STORAGE_BACKEND=supabase plus SUPABASE_URL and SUPABASE_SERVICE_KEY.
  See supabase/README.md for bucket setup.
    """

    def __init__(self, url: str, service_key: str, bucket: str) -> None:
        if not url or not service_key:
            raise RuntimeError(
                "STORAGE_BACKEND=supabase requires SUPABASE_URL and SUPABASE_SERVICE_KEY. "
                "See supabase/README.md."
            )
        self.url = url.rstrip("/")
        self.service_key = service_key
        self.bucket = bucket

    def save(self, filename: str, data: bytes, content_type: str | None = None) -> str:
        safe_name = filename.replace("/", "_").replace("\\", "_")
        key = f"{uuid4().hex}_{safe_name}"
        # Stub: production upload via supabase-py or httpx to Storage API.
        # POST {url}/storage/v1/object/{bucket}/{key}
        raise NotImplementedError(
            f"Supabase upload for '{key}' is scaffolded but not wired yet. "
            "Use STORAGE_BACKEND=local for development, or implement upload in "
            "SupabaseStorageBackend.save()."
        )

    def get_url(self, key: str) -> str:
        return f"{self.url}/storage/v1/object/public/{self.bucket}/{key}"


def get_storage_backend() -> StorageBackend:
    settings = get_settings()
    if settings.storage_backend == "local":
        return LocalStorageBackend(settings.upload_path)
    if settings.storage_backend == "supabase":
        return SupabaseStorageBackend(
            url=settings.supabase_url,
            service_key=settings.supabase_service_key,
            bucket=settings.supabase_storage_bucket,
        )
    raise ValueError(
        f"Unknown STORAGE_BACKEND '{settings.storage_backend}'. Use 'local' or 'supabase'."
    )
