from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.collection import Collection, CollectionProduct
from app.schemas.admin import CollectionSchema

router = APIRouter(prefix="/collections", tags=["collections"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[CollectionSchema])
async def list_collections(db: DbSession) -> list[CollectionSchema]:
    collections = (
        await db.execute(
            select(Collection).where(Collection.published.is_(True)).order_by(Collection.sort_order)
        )
    ).scalars().all()

    result = []
    for col in collections:
        count = (
            await db.execute(
                select(func.count())
                .select_from(CollectionProduct)
                .where(CollectionProduct.collection_id == col.id)
            )
        ).scalar_one()
        result.append(
            CollectionSchema(
                id=col.id,
                slug=col.slug,
                name=col.name,
                description=col.description,
                imageUrl=col.image_url,
                featured=col.featured,
                published=col.published,
                sortOrder=col.sort_order,
                productCount=count,
            )
        )
    return result
