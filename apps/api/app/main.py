from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.middleware.logging import RequestLoggingMiddleware
from app.routers import (
    artisans,
    auth,
    cart,
    categories,
    chat,
    checkout,
    collections,
    discounts,
    health,
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
app.include_router(wishlist.router)
app.include_router(admin_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Alankara API", "docs": "/docs"}
