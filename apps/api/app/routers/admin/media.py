import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.auth.deps import require_admin
from app.schemas.auth import UserClaims
from app.services.storage import get_storage_backend

router = APIRouter(prefix="/admin/media", tags=["admin-media"])

AdminUser = Annotated[UserClaims, Depends(require_admin)]

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


class MediaUploadResponse(BaseModel):
    url: str
    key: str


@router.post("/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    _admin: AdminUser,
    file: UploadFile = File(...),
) -> MediaUploadResponse:
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {content_type}. Allowed: JPEG, PNG, WebP, GIF.",
        )

    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Max 10MB")

    filename = file.filename or f"upload-{uuid.uuid4().hex}.jpg"
    backend = get_storage_backend()
    key = backend.save(filename, data, content_type)
    return MediaUploadResponse(url=backend.get_url(key), key=key)
