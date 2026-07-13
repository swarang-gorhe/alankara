import math
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.deps import require_admin
from app.database import get_db
from app.models.collection import Collection, CollectionProduct
from app.schemas.auth import UserClaims

router = APIRouter(prefix="/admin/collections", tags=["admin-collections"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
AdminUser = Annotated[UserClaims, Depends(require_admin)]


class CollectionAdminSchema(BaseModel):
    id: str
    slug: str
    name: str
    description: str | None = None
    imageUrl: str | None = None
    featured: bool = False
    published: bool = True
    sortOrder: int = 0
    productIds: list[str] = Field(default_factory=list)


class CollectionCreateSchema(BaseModel):
    slug: str = Field(..., min_length=2, max_length=128)
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    imageUrl: str | None = None
    featured: bool = False
    published: bool = True
    sortOrder: int = 0
    productIds: list[str] = Field(default_factory=list)


class CollectionUpdateSchema(BaseModel):
    slug: str | None = None
    name: str | None = None
    description: str | None = None
    imageUrl: str | None = None
    featured: bool | None = None
    published: bool | None = None
    sortOrder: int | None = None
    productIds: list[str] | None = None


class PaginatedCollectionsSchema(BaseModel):
    items: list[CollectionAdminSchema]
    total: int
    page: int
    page_size: int
    pages: int


def _to_schema(col: Collection) -> CollectionAdminSchema:
    return CollectionAdminSchema(
        id=col.id,
        slug=col.slug,
        name=col.name,
        description=col.description,
        imageUrl=col.image_url,
        featured=col.featured,
        published=col.published,
        sortOrder=col.sort_order,
        productIds=[cp.product_id for cp in col.products],
    )


async def _get_collection(db: AsyncSession, collection_id: str) -> Collection:
    result = await db.execute(
        select(Collection)
        .where(Collection.id == collection_id)
        .options(selectinload(Collection.products))
    )
    col = result.scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return col


@router.get("", response_model=PaginatedCollectionsSchema)
async def list_collections(
    db: DbSession,
    _admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
) -> PaginatedCollectionsSchema:
    total = (await db.execute(select(func.count()).select_from(Collection))).scalar_one()
    offset = (page - 1) * page_size
    result = await db.execute(
        select(Collection)
        .options(selectinload(Collection.products))
        .order_by(Collection.sort_order)
        .offset(offset)
        .limit(page_size)
    )
    items = [_to_schema(c) for c in result.scalars().unique().all()]
    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedCollectionsSchema(
        items=items, total=total, page=page, page_size=page_size, pages=pages
    )


@router.post("", response_model=CollectionAdminSchema, status_code=status.HTTP_201_CREATED)
async def create_collection(
    body: CollectionCreateSchema, db: DbSession, _admin: AdminUser
) -> CollectionAdminSchema:
    now = datetime.now(UTC)
    col = Collection(
        id=f"col-{uuid.uuid4().hex[:12]}",
        slug=body.slug,
        name=body.name,
        description=body.description,
        image_url=body.imageUrl,
        featured=body.featured,
        published=body.published,
        sort_order=body.sortOrder,
        created_at=now,
        updated_at=now,
    )
    db.add(col)
    await db.flush()
    for i, pid in enumerate(body.productIds):
        db.add(CollectionProduct(collection_id=col.id, product_id=pid, sort_order=i))
    await db.commit()
    return _to_schema(await _get_collection(db, col.id))


@router.put("/{collection_id}", response_model=CollectionAdminSchema)
async def update_collection(
    collection_id: str, body: CollectionUpdateSchema, db: DbSession, _admin: AdminUser
) -> CollectionAdminSchema:
    col = await _get_collection(db, collection_id)
    if body.slug is not None:
        col.slug = body.slug
    if body.name is not None:
        col.name = body.name
    if body.description is not None:
        col.description = body.description
    if body.imageUrl is not None:
        col.image_url = body.imageUrl
    if body.featured is not None:
        col.featured = body.featured
    if body.published is not None:
        col.published = body.published
    if body.sortOrder is not None:
        col.sort_order = body.sortOrder
    col.updated_at = datetime.now(UTC)
    if body.productIds is not None:
        for cp in list(col.products):
            await db.delete(cp)
        await db.flush()
        for i, pid in enumerate(body.productIds):
            db.add(CollectionProduct(collection_id=col.id, product_id=pid, sort_order=i))
    await db.commit()
    return _to_schema(await _get_collection(db, collection_id))


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(collection_id: str, db: DbSession, _admin: AdminUser) -> None:
    col = await _get_collection(db, collection_id)
    await db.delete(col)
    await db.commit()
