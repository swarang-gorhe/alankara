from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.auth.jwt import decode_access_token, is_admin_claim
from app.schemas.auth import UserClaims

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserClaims | None:
    if credentials is None:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        return UserClaims(
            sub=payload["sub"],
            email=payload["email"],
            role=payload.get("role", "customer"),
        )
    except (JWTError, KeyError):
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
