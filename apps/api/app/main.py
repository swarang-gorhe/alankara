from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import artisans, auth, cart, categories, checkout, health, products, reviews
from app.services.storage import get_storage_backend

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.storage_backend == "local":
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

app.include_router(health.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(reviews.router)
app.include_router(artisans.router)
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(checkout.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Alankara API", "docs": "/docs"}
