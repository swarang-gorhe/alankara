import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database import get_db
from app.models.address import Address
from app.schemas.auth import UserClaims

router = APIRouter(prefix="/addresses", tags=["addresses"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[UserClaims, Depends(get_current_user)]


class AddressSchema(BaseModel):
    id: str
    name: str
    email: str
    phone: str | None = None
    line1: str
    line2: str | None = None
    city: str
    state: str
    postalCode: str
    country: str = "IN"
    createdAt: datetime


class AddressCreate(BaseModel):
    name: str = Field(min_length=1)
    email: str
    phone: str | None = None
    line1: str = Field(min_length=1)
    line2: str | None = None
    city: str = Field(min_length=1)
    state: str = Field(min_length=1)
    postalCode: str = Field(min_length=1)
    country: str = "IN"


class AddressUpdate(AddressCreate):
    pass


def _addr_to_schema(addr: Address) -> AddressSchema:
    return AddressSchema(
        id=addr.id,
        name=addr.name,
        email=addr.email,
        phone=addr.phone,
        line1=addr.line1,
        line2=addr.line2,
        city=addr.city,
        state=addr.state,
        postalCode=addr.postal_code,
        country=addr.country,
        createdAt=addr.created_at,
    )


@router.get("", response_model=list[AddressSchema])
async def list_addresses(db: DbSession, user: CurrentUser) -> list[AddressSchema]:
    result = await db.execute(
        select(Address).where(Address.user_id == user.sub).order_by(Address.created_at.desc())
    )
    return [_addr_to_schema(a) for a in result.scalars().all()]


@router.post("", response_model=AddressSchema, status_code=status.HTTP_201_CREATED)
async def create_address(
    body: AddressCreate, db: DbSession, user: CurrentUser
) -> AddressSchema:
    addr = Address(
        id=f"addr-{uuid.uuid4().hex[:12]}",
        user_id=user.sub,
        name=body.name,
        email=body.email,
        phone=body.phone,
        line1=body.line1,
        line2=body.line2,
        city=body.city,
        state=body.state,
        postal_code=body.postalCode,
        country=body.country,
        created_at=datetime.now(UTC),
    )
    db.add(addr)
    await db.commit()
    await db.refresh(addr)
    return _addr_to_schema(addr)


@router.patch("/{address_id}", response_model=AddressSchema)
async def update_address(
    address_id: str, body: AddressUpdate, db: DbSession, user: CurrentUser
) -> AddressSchema:
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == user.sub)
    )
    addr = result.scalar_one_or_none()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    addr.name = body.name
    addr.email = body.email
    addr.phone = body.phone
    addr.line1 = body.line1
    addr.line2 = body.line2
    addr.city = body.city
    addr.state = body.state
    addr.postal_code = body.postalCode
    addr.country = body.country
    await db.commit()
    await db.refresh(addr)
    return _addr_to_schema(addr)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(address_id: str, db: DbSession, user: CurrentUser) -> None:
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == user.sub)
    )
    addr = result.scalar_one_or_none()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    await db.delete(addr)
    await db.commit()
