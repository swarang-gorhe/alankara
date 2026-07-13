from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.auth.jwt import decode_access_token, is_admin_claim
from app.auth.supabase_jwt import decode_supabase_access_token
from app.config import get_settings
from app.schemas.auth import UserClaims

bearer_scheme = HTTPBearer(auto_error=False)


def _claims_from_payload(payload: dict) -> UserClaims:
    role = payload.get("role")
    if not role:
        app_meta = payload.get("app_metadata") or {}
        user_meta = payload.get("user_metadata") or {}
        role = app_meta.get("role") or user_meta.get("role") or "customer"
    email = payload.get("email") or ""
    sub = payload.get("sub") or ""
    return UserClaims(sub=sub, email=email, role=role)


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserClaims | None:
    if credentials is None:
        return None
    token = credentials.credentials
    settings = get_settings()

    # Try FastAPI dev JWT first
    try:
        payload = decode_access_token(token)
        return _claims_from_payload(payload)
    except (JWTError, KeyError):
        pass

    # Supabase JWT when configured
    if settings.supabase_jwt_secret:
        try:
            payload = decode_supabase_access_token(token)
            return _claims_from_payload(payload)
        except JWTError:
            return None

    return None


async def get_current_user(
    user: UserClaims | None = Depends(get_current_user_optional),
) -> UserClaims:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


async def require_admin(user: UserClaims = Depends(get_current_user)) -> UserClaims:
    if not is_admin_claim(user.model_dump()):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
