import math
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import require_admin
from app.database import get_db
from app.models.category import Category
from app.schemas.auth import UserClaims

router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


class CategoryAdminSchema(BaseModel):
    id: str
    slug: str
    name: str
    description: str | None = None
    imageUrl: str | None = None


class CategoryCreateSchema(BaseModel):
    slug: str = Field(..., min_length=2, max_length=64)
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    imageUrl: str | None = None


class CategoryUpdateSchema(BaseModel):
    slug: str | None = Field(None, min_length=2, max_length=64)
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    imageUrl: str | None = None


class PaginatedCategoriesSchema(BaseModel):
    items: list[CategoryAdminSchema]
    total: int
    page: int
    page_size: int
    pages: int


def _to_schema(cat: Category) -> CategoryAdminSchema:
    return CategoryAdminSchema(
        id=cat.id,
        slug=cat.slug,
        name=cat.name,
        description=cat.description,
        imageUrl=cat.image_url,
    )


@router.get("", response_model=PaginatedCategoriesSchema)
async def list_categories(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
) -> PaginatedCategoriesSchema:
    total = (await db.execute(select(func.count()).select_from(Category))).scalar_one()
    offset = (page - 1) * page_size
    result = await db.execute(
        select(Category).order_by(Category.name).offset(offset).limit(page_size)
    )
    items = [_to_schema(c) for c in result.scalars().all()]
    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedCategoriesSchema(
        items=items, total=total, page=page, page_size=page_size, pages=pages
    )


@router.post("", response_model=CategoryAdminSchema, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreateSchema, db: DbSession, _admin: AdminUser
) -> CategoryAdminSchema:
    existing = await db.execute(select(Category).where(Category.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug exists")
    cat = Category(
        id=f"cat-{uuid.uuid4().hex[:12]}",
        slug=body.slug,
        name=body.name,
        description=body.description,
        image_url=body.imageUrl,
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return _to_schema(cat)


@router.put("/{category_id}", response_model=CategoryAdminSchema)
async def update_category(
    category_id: str, body: CategoryUpdateSchema, db: DbSession, _admin: AdminUser
) -> CategoryAdminSchema:
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if body.slug is not None:
        cat.slug = body.slug
    if body.name is not None:
        cat.name = body.name
    if body.description is not None:
        cat.description = body.description
    if body.imageUrl is not None:
        cat.image_url = body.imageUrl
    await db.commit()
    await db.refresh(cat)
    return _to_schema(cat)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, db: DbSession, _admin: AdminUser) -> None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await db.delete(cat)
    await db.commit()
