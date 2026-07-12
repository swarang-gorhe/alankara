from app.models.artisan import Artisan
from app.models.product import Product, ProductVariant
from app.schemas.artisan import ArtisanSchema
from app.schemas.product import ProcessStepSchema, ProductSchema, ProductVariantSchema


def product_to_schema(product: Product) -> ProductSchema:
    category_slug = product.category.slug if product.category else ""
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
        variants=[variant_to_schema(v) for v in product.variants],
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
