"""Tests for storage backend env switch."""

import pytest

from app.services.storage import LocalStorageBackend, SupabaseStorageBackend, get_storage_backend


def test_local_storage_backend(tmp_path, monkeypatch):
    monkeypatch.setenv("STORAGE_BACKEND", "local")
    monkeypatch.setenv("LOCAL_UPLOAD_DIR", str(tmp_path))

    from app.config import get_settings

    get_settings.cache_clear()

    backend = get_storage_backend()
    assert isinstance(backend, LocalStorageBackend)
    key = backend.save("test.jpg", b"hello", "image/jpeg")
    assert (tmp_path / key).read_bytes() == b"hello"
    assert backend.get_url(key) == f"/uploads/{key}"


def test_supabase_storage_requires_credentials(monkeypatch):
    monkeypatch.setenv("STORAGE_BACKEND", "supabase")
    monkeypatch.setenv("SUPABASE_URL", "")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "")

    from app.config import get_settings

    get_settings.cache_clear()

    with pytest.raises(RuntimeError, match="SUPABASE_URL"):
        get_storage_backend()


def test_supabase_storage_get_url(monkeypatch):
    backend = SupabaseStorageBackend(
        url="https://example.supabase.co",
        service_key="test-key",
        bucket="product-images",
    )
    assert (
        backend.get_url("abc.jpg")
        == "https://example.supabase.co/storage/v1/object/public/product-images/abc.jpg"
    )
