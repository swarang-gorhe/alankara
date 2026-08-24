from sqlalchemy import inspect as sa_inspect

from app.models.artisan import Artisan
from app.models.product import Product, ProductVariant
from app.models.review import Review
from app.schemas.artisan import ArtisanSchema
from app.schemas.product import ProcessStepSchema, ProductSchema, ProductVariantSchema
from app.schemas.review import PublicReviewSchema, ReviewSchema


def product_to_schema(product: Product) -> ProductSchema:
    category_slug = product.category.slug if product.category else ""
    approved_reviews = []
    state = sa_inspect(product)
    if "reviews" not in state.unloaded:
        approved_reviews = [r for r in (product.reviews or []) if getattr(r, "approved", False)]
    avg = None
    if approved_reviews:
        avg = round(sum(r.rating for r in approved_reviews) / len(approved_reviews), 1)
    return ProductSchema(
        id=product.id,
        slug=product.slug,
        name=product.name,
        description=product.description,
        shortDescription=product.short_description,
        categoryId=product.category_id,
        categorySlug=category_slug,
        images=product.images or [],
        primaryMaterial=product.primary_material,
        minPrice=product.min_price,
        materials=product.materials or [],
        careInstructions=product.care_instructions,
        featured=product.featured,
        occasion=product.occasion or [],
        process=[ProcessStepSchema(**step) for step in (product.process or [])],
        relatedSlugs=product.related_slugs or [],
        tags=product.tags or [],
        aiGeneratedTags=product.ai_generated_tags or [],
        status=getattr(product, "status", None) or "published",
        variants=[variant_to_schema(v) for v in product.variants],
        averageRating=avg,
        reviewCount=len(approved_reviews),
    )


def variant_to_schema(variant: ProductVariant) -> ProductVariantSchema:
    return ProductVariantSchema(
        id=variant.id,
        sku=variant.sku,
        size=variant.size,
        color=variant.color,
        material=variant.material,
        price={"amount": variant.price_amount, "currency": variant.price_currency},
        stock=variant.stock,
    )


def artisan_to_schema(artisan: Artisan) -> ArtisanSchema:
    return ArtisanSchema(
        id=artisan.id,
        slug=artisan.slug,
        name=artisan.name,
        title=artisan.title,
        location=artisan.location,
        bio=artisan.bio,
        specialty=artisan.specialty,
        yearsExperience=artisan.years_experience,
        quote=artisan.quote,
    )


def review_to_schema(review: Review) -> ReviewSchema:
    product = review.product
    return ReviewSchema(
        id=review.id,
        productId=review.product_id,
        productSlug=product.slug if product else "",
        productName=product.name if product else "",
        categorySlug=product.category.slug if product and product.category else "",
        userId=review.user_id,
        authorName=review.author_name,
        rating=review.rating,
        title=review.title,
        text=review.text,
        createdAt=review.created_at,
        approved=review.approved,
        verifiedPurchase=bool(review.verified_purchase),
        status=review.status or ("approved" if review.approved else "pending"),
        customerEmail=review.customer_email,
    )


def review_to_public_schema(review: Review) -> PublicReviewSchema:
    product = review.product
    return PublicReviewSchema(
        id=review.id,
        productId=review.product_id,
        productSlug=product.slug if product else "",
        productName=product.name if product else "",
        categorySlug=product.category.slug if product and product.category else "",
        authorName=review.author_name,
        rating=review.rating,
        title=review.title,
        text=review.text,
        createdAt=review.created_at,
        verifiedPurchase=bool(review.verified_purchase),
    )
