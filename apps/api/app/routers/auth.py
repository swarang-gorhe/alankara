from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.deps import get_current_user, require_admin
from app.auth.jwt import create_access_token
from app.config import get_settings
from app.schemas.auth import LoginRequest, TokenResponse, UserClaims, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# Dev-only admin credentials scaffold — replaced by Supabase Auth in Phase 8
_DEV_ADMIN_EMAIL = "admin@alankara.local"
_DEV_ADMIN_PASSWORD = "admin-dev-only"


def _ensure_dev_auth_allowed() -> None:
    if get_settings().environment != "local":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dev login is disabled in this environment",
        )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    """Issue a JWT for local development. Disabled outside environment=local."""
    _ensure_dev_auth_allowed()
    if body.email == _DEV_ADMIN_EMAIL and body.password == _DEV_ADMIN_PASSWORD:
        token = create_access_token(
            subject="admin-001",
            email=body.email,
            role="admin",
        )
        return TokenResponse(access_token=token)

    if body.password == "customer-dev":
        token = create_access_token(
            subject=f"user-{body.email}",
            email=body.email,
            role="customer",
        )
        return TokenResponse(access_token=token)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.get("/me", response_model=UserResponse)
async def me(user: UserClaims = Depends(get_current_user)) -> UserResponse:
    return UserResponse(id=user.sub, email=user.email, role=user.role)


@router.get("/admin/ping")
async def admin_ping(_admin: UserClaims = Depends(require_admin)) -> dict[str, str]:
    """Scaffold endpoint — verifies admin JWT for Phase 6 admin panel."""
    return {"status": "ok", "message": "Admin access granted"}
