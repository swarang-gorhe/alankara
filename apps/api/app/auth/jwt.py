from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt

from app.config import get_settings


def create_access_token(
    subject: str,
    email: str,
    role: str = "customer",
    expires_delta: timedelta | None = None,
) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.jwt_expire_minutes)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "email": email,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def is_admin_claim(payload: dict[str, Any]) -> bool:
    return payload.get("role") == "admin"
