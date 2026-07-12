from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategorySchema

router = APIRouter(prefix="/categories", tags=["categories"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[CategorySchema])
async def list_categories(db: DbSession) -> list[CategorySchema]:
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return [
        CategorySchema(
            id=c.id,
            slug=c.slug,
            name=c.name,
            description=c.description,
            imageUrl=c.image_url,
        )
        for c in categories
    ]
