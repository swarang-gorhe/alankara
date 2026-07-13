from jose import jwt

from app.config import get_settings


def decode_supabase_access_token(token: str) -> dict:
    """Validate Supabase-issued JWT using the project JWT secret."""
    settings = get_settings()
    secret = settings.supabase_jwt_secret or settings.jwt_secret
    return jwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        audience="authenticated",
        options={"verify_aud": bool(settings.supabase_jwt_secret)},
    )
