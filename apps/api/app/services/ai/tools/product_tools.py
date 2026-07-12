from __future__ import annotations

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import async_session_maker
from app.models.product import Product


@tool
def get_product(product_id: str) -> str:
    """Fetch product details by ID for copy drafting."""
    import asyncio

    async def _run() -> str:
        async with async_session_maker() as db:
            result = await db.execute(
                select(Product)
                .where(Product.id == product_id)
                .options(selectinload(Product.category), selectinload(Product.variants))
            )
            product = result.scalar_one_or_none()
            if product is None:
                return f"Product {product_id} not found."
            return (
                f"Name: {product.name}\nSlug: {product.slug}\n"
                f"Description: {product.description}\n"
                f"Materials: {product.materials}\n"
                f"Care: {product.care_instructions}"
            )

    return asyncio.run(_run())


@tool
def get_category(category_id: str) -> str:
    """Fetch category name and slug."""
    import asyncio

    from app.models.category import Category

    async def _run() -> str:
        async with async_session_maker() as db:
            result = await db.execute(select(Category).where(Category.id == category_id))
            cat = result.scalar_one_or_none()
            if cat is None:
                return f"Category {category_id} not found."
            return f"Category: {cat.name} ({cat.slug}) — {cat.description}"

    return asyncio.run(_run())


@tool
def draft_description(product_id: str, tone: str = "luxury editorial") -> str:
    """Return a draft product description — does NOT write to database."""
    product = get_product.invoke(product_id)
    return (
        f"[DRAFT ONLY — admin must approve before publishing]\n"
        f"Tone: {tone}\nBased on:\n{product}\n\n"
        "Suggested description: Craft an heirloom-worthy piece that honours slow artistry..."
    )
