"""Seed database from web fixture JSON files."""

from __future__ import annotations

import argparse
import asyncio
import json
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_maker, engine
from app.models import Artisan, Category, Product, ProductVariant, Review, ReviewSummary

FIXTURES_DIR = Path(__file__).resolve().parents[2] / "web" / "lib" / "fixtures"


def load_json(name: str) -> list | dict:
    path = FIXTURES_DIR / name
    with path.open(encoding="utf-8") as f:
        return json.load(f)


async def seed_categories(session: AsyncSession) -> None:
    for row in load_json("categories.json"):
        category_id = f"cat-{row['slug']}"
        session.add(
            Category(
                id=category_id,
                slug=row["slug"],
                name=row["name"],
                description=row.get("description"),
            )
        )


async def seed_products(session: AsyncSession) -> None:
    for row in load_json("products.json"):
        session.add(
            Product(
                id=row["id"],
                slug=row["slug"],
                name=row["name"],
                description=row["description"],
                short_description=row.get("shortDescription"),
                category_id=row["categoryId"],
                primary_material=row["primaryMaterial"],
                min_price=row["minPrice"],
                materials=row.get("materials"),
                care_instructions=row.get("careInstructions"),
                featured=row.get("featured", False),
                occasion=row.get("occasion"),
                process=row.get("process"),
                related_slugs=row.get("relatedSlugs"),
                images=row.get("images"),
            )
        )
        for variant in row.get("variants", []):
            session.add(
                ProductVariant(
                    id=variant["id"],
                    product_id=row["id"],
                    sku=variant["sku"],
                    size=variant.get("size"),
                    color=variant.get("color"),
                    material=variant.get("material"),
                    price_amount=variant["price"]["amount"],
                    price_currency=variant["price"].get("currency", "INR"),
                    stock=variant.get("stock", 0),
                )
            )


async def seed_artisans(session: AsyncSession) -> None:
    for row in load_json("artisans.json"):
        session.add(
            Artisan(
                id=row["id"],
                slug=row["slug"],
                name=row["name"],
                title=row["title"],
                location=row["location"],
                bio=row["bio"],
                specialty=row["specialty"],
                years_experience=row["yearsExperience"],
                quote=row["quote"],
            )
        )


async def seed_reviews(session: AsyncSession) -> None:
    for row in load_json("reviews.json"):
        created_at = datetime.fromisoformat(row["createdAt"].replace("Z", "+00:00"))
        session.add(
            Review(
                id=row["id"],
                product_id=row["productId"],
                user_id=row.get("userId"),
                author_name=row["authorName"],
                rating=row["rating"],
                text=row["text"],
                created_at=created_at,
                approved=row.get("approved", True),
            )
        )


async def seed_review_summaries(session: AsyncSession) -> None:
    insights = load_json("ai-insights.json")
    session.add(
        ReviewSummary(
            id="summary-global",
            product_id=None,
            scope="global",
            generated_summary=insights["summary"],
            generated_at=datetime.now(UTC),
        )
    )


async def database_is_seeded(session: AsyncSession) -> bool:
    result = await session.execute(select(Product.id).limit(1))
    return result.scalar_one_or_none() is not None


async def run_seed(force: bool = False) -> None:
    async with async_session_maker() as session:
        if not force and await database_is_seeded(session):
            print("Database already seeded — skipping (use --force to re-seed)")
            return

        if force:
            await session.execute(Review.__table__.delete())
            await session.execute(ReviewSummary.__table__.delete())
            await session.execute(ProductVariant.__table__.delete())
            await session.execute(Product.__table__.delete())
            await session.execute(Category.__table__.delete())
            await session.execute(Artisan.__table__.delete())
            await session.commit()

        await seed_categories(session)
        await seed_products(session)
        await seed_artisans(session)
        await seed_reviews(session)
        await seed_review_summaries(session)
        await session.commit()
        print("Seed complete.")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Alankara database from fixtures")
    parser.add_argument("--force", action="store_true", help="Clear catalog tables and re-seed")
    args = parser.parse_args()
    await run_seed(force=args.force)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
