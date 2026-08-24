from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    # Plain str — EmailStr rejects special-use domains like .local used by
    # local-only atelier credentials (admin@alankara.local).
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1)


class UserClaims(BaseModel):
    sub: str
    email: str
    role: str = "customer"


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
