from abc import ABC, abstractmethod
from pathlib import Path
from uuid import uuid4

import httpx

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
        settings = get_settings()
        base = settings.api_public_url.rstrip("/") if settings.api_public_url else ""
        if base:
            return f"{base}/uploads/{key}"
        return f"/uploads/{key}"


class SupabaseStorageBackend(StorageBackend):
    """Upload to Supabase Storage via REST API."""

    def __init__(self, url: str, service_key: str, bucket: str) -> None:
        if not url or not service_key:
            raise RuntimeError(
                "STORAGE_BACKEND=supabase requires SUPABASE_URL and SUPABASE_SERVICE_KEY."
            )
        self.url = url.rstrip("/")
        self.service_key = service_key
        self.bucket = bucket

    def save(self, filename: str, data: bytes, content_type: str | None = None) -> str:
        safe_name = filename.replace("/", "_").replace("\\", "_")
        key = f"{uuid4().hex}_{safe_name}"
        upload_url = f"{self.url}/storage/v1/object/{self.bucket}/{key}"
        headers = {
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": content_type or "application/octet-stream",
        }
        with httpx.Client(timeout=60.0) as client:
            res = client.post(upload_url, headers=headers, content=data)
            res.raise_for_status()
        return key

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
