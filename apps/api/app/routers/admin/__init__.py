from fastapi import APIRouter

from app.routers.admin import (
    ai,
    categories,
    collections,
    customers,
    dashboard,
    discounts,
    faq,
    media,
    orders,
    products,
    reviews,
)

router = APIRouter(tags=["admin"])

router.include_router(dashboard.router)
router.include_router(products.router)
router.include_router(media.router)
router.include_router(categories.router)
router.include_router(collections.router)
router.include_router(customers.router)
router.include_router(discounts.router)
router.include_router(orders.router)
router.include_router(faq.router)
router.include_router(reviews.router)
router.include_router(ai.router)
