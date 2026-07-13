import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.middleware.logging import RequestLoggingMiddleware
from app.routers import (
    addresses,
    artisans,
    auth,
    cart,
    categories,
    chat,
    checkout,
    collections,
    discounts,
    health,
    orders,
    products,
    reviews,
    wishlist,
)
from app.routers.admin import router as admin_router
from app.services.storage import get_storage_backend

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    weak_secret = settings.jwt_secret in ("", "change-me-in-production")
    if settings.environment not in ("local", "test") and weak_secret:
        raise RuntimeError(
            "JWT_SECRET must be set to a strong value when environment is not local/test"
        )
    if settings.storage_backend in ("local", "supabase"):
        get_storage_backend()
    yield


app = FastAPI(
    title="Alankara API",
    description="Luxury e-commerce backend for Alankara",
    version=settings.api_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(collections.router)
app.include_router(reviews.router)
app.include_router(artisans.router)
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(checkout.router)
app.include_router(discounts.router)
app.include_router(orders.router)
app.include_router(addresses.router)
app.include_router(wishlist.router)
app.include_router(admin_router)

upload_dir = settings.upload_path
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Alankara API", "docs": "/docs"}
