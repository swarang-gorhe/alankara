from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.artisan import Artisan
from app.schemas.artisan import ArtisanSchema
from app.schemas.mappers import artisan_to_schema

router = APIRouter(prefix="/artisans", tags=["artisans"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[ArtisanSchema])
async def list_artisans(db: DbSession) -> list[ArtisanSchema]:
    result = await db.execute(select(Artisan).order_by(Artisan.name))
    return [artisan_to_schema(a) for a in result.scalars().all()]
