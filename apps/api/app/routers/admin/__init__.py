from fastapi import APIRouter

from app.routers.admin import dashboard, discounts, faq, orders, products, reviews

router = APIRouter(tags=["admin"])

router.include_router(dashboard.router)
router.include_router(products.router)
router.include_router(discounts.router)
router.include_router(orders.router)
router.include_router(faq.router)
router.include_router(reviews.router)
