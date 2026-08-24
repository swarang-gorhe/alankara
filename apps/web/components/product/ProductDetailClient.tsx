"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuxuryImage } from "@/components/media";
import { ProductGallery } from "@/components/product/ProductGallery";
import { RecommendationRail } from "@/components/shop/RecommendationRail";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { PearlRating } from "@/components/reviews/PearlRating";
import { TryOnButton } from "@/components/try-on/TryOnButton";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { fetchProductReviewSummary } from "@/lib/api/ai";
import { logCustomerEvent } from "@/lib/api/commerce";
import { addToWishlist } from "@/lib/api/wishlist";
import { formatPrice, MATERIAL_LABELS, getProductSize } from "@/lib/fixtures";
import type { ProductFixture, ReviewFixture } from "@/lib/fixtures/types";
import { MATERIAL_CHAPTER, MEDIA } from "@/lib/media";

type ProductDetailClientProps = {
  product: ProductFixture;
  relatedProducts: ProductFixture[];
  productReviews: ReviewFixture[];
};

export function ProductDetailClient({
  product,
  relatedProducts,
  productReviews,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<string | null>(null);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const lowStock =
    inStock && selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5;

  useEffect(() => {
    void logCustomerEvent(product.id, "viewed");
  }, [product.id]);

  useEffect(() => {
    fetchProductReviewSummary(product.slug)
      .then((data) => setReviewSummary(data?.summary ?? null))
      .catch(() => setReviewSummary(null));
  }, [product.slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !inStock) return;
    setAdding(true);
    setAddError(null);
    try {
      await addToCart(selectedVariant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/product/${product.slug}`;
      return;
    }
    setWishlistSaving(true);
    try {
      await addToWishlist(product.id, selectedVariant?.id);
      setWishlisted(true);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Could not save to wishlist");
    } finally {
      setWishlistSaving(false);
    }
  };

  return (
    <div className="relative overflow-x-hidden bg-ivory">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <ProductGallery name={product.name} slug={product.slug} images={product.images} />
          </div>

          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <p className="font-body text-xs uppercase tracking-[0.25em] text-champagne">
              {product.categorySlug.replace(/-/g, " ")}
              {getProductSize(product) ? ` · ${getProductSize(product)}` : ""}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-maroon md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 font-body text-lg leading-relaxed text-ink-muted">
              {product.shortDescription}
            </p>
            <p className="mt-6 font-display text-3xl text-maroon">
              {selectedVariant && formatPrice(selectedVariant.price.amount)}
            </p>
            {(product.reviewCount ?? productReviews.length) > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <PearlRating rating={Math.round(product.averageRating ?? 0)} />
                <span className="text-xs text-ink-muted">
                  {(product.averageRating ?? 0).toFixed(1)} · {product.reviewCount ?? productReviews.length} notes
                </span>
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-champagne/20 py-6 font-body text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-olive">Materials</dt>
                <dd className="mt-1 text-ink">
                  {MATERIAL_LABELS[product.primaryMaterial] ?? product.primaryMaterial}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-olive">Weight</dt>
                <dd className="mt-1 text-ink">Lightweight cloth</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-olive">Availability</dt>
                <dd className="mt-1 text-ink">{inStock ? "In studio" : "Currently resting"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-olive">Care</dt>
                <dd className="mt-1 text-ink">Spot clean · cotton pouch</dd>
              </div>
            </dl>

            {product.variants.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 font-body text-xs uppercase tracking-widest text-ink-muted">
                  {product.variants.length > 1 ? "Select variant" : "Variant"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Chip
                      key={variant.id}
                      variant={selectedVariantId === variant.id ? "active" : "default"}
                      disabled={variant.stock <= 0}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      {[variant.material, variant.size, variant.color].filter(Boolean).join(" · ")}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button disabled={!inStock || adding} onClick={() => void handleAddToCart()} className="min-w-[140px]">
                {adding ? "Adding…" : added ? "Added to cart" : inStock ? "Add to cart" : "Out of stock"}
              </Button>
              <Button
                variant="outline"
                disabled={!inStock || adding}
                onClick={async () => {
                  await handleAddToCart();
                  window.location.href = "/checkout";
                }}
              >
                Buy now
              </Button>
              <TryOnButton product={product} />
              <Button
                variant="ghost"
                disabled={wishlistSaving || wishlisted}
                onClick={() => void handleWishlist()}
              >
                {wishlisted ? "Saved" : "Wishlist"}
              </Button>
            </div>
            {addError && <p className="mt-3 font-body text-xs text-error">{addError}</p>}
            {lowStock && inStock && (
              <p className="mt-3 font-body text-xs uppercase tracking-widest text-champagne">
                Only {selectedVariant?.stock} left in the atelier
              </p>
            )}
            {!inStock && (
              <p className="mt-3 font-body text-sm text-ink-muted">
                This piece is resting. Write to us if you would like it remade.
              </p>
            )}
            {added && (
              <p className="mt-3 font-body text-xs text-champagne">
                <Link href="/cart" className="underline underline-offset-2">
                  View cart →
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-champagne/15 bg-linen/30 px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-olive">The story</p>
            <h2 className="mt-4 font-display text-3xl text-maroon md:text-4xl">Why this pair</h2>
          </div>
          <p className="font-body text-lg leading-relaxed text-ink lg:col-span-7 md:text-xl">
            {product.description}
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-olive">At the table</p>
          <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">Atelier materials</h2>
          <p className="mt-4 max-w-xl font-body text-base text-ink-muted">
            These stills are the cloth, thread, and pearls we work with — not extra angles of this
            pair. The jewellery photograph stays the same, contained on linen.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {MATERIAL_CHAPTER.map((item) => (
              <figure key={item.asset.id}>
                <LuxuryImage
                  src={item.asset.src}
                  alt={item.asset.alt}
                  width={item.asset.width}
                  height={item.asset.height}
                  fit="cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="aspect-[4/5] w-full border border-champagne/15"
                />
                <figcaption className="mt-3">
                  <p className="font-display text-lg text-maroon">{item.kicker}</p>
                  <p className="mt-1 font-body text-sm text-ink-muted">{item.title}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <ul className="mt-10 flex flex-wrap gap-3">
            {product.materials?.map((material) => (
              <li
                key={material}
                className="rounded-full border border-sage/30 px-4 py-1.5 font-body text-sm text-ink"
              >
                {material}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-champagne/15 bg-ivory px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          {(product.process ?? []).map((step, index) => (
            <article key={step.title}>
              <span className="font-display text-4xl text-champagne/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-display text-xl text-maroon">{step.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-olive">Care</p>
            <p className="mt-4 font-body text-lg leading-relaxed text-ink-muted">
              {product.careInstructions}
            </p>
          </div>
          <LuxuryImage
            src={MEDIA.threadBrown.src}
            alt={MEDIA.threadBrown.alt}
            width={MEDIA.threadBrown.width}
            height={MEDIA.threadBrown.height}
            fit="cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="aspect-[16/10] w-full border border-champagne/15"
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        {reviewSummary && (
          <div className="mb-10">
            <p className="font-body text-[11px] uppercase tracking-[0.3em] text-champagne">
              What wearers say
            </p>
            <p className="mt-4 font-body text-lg leading-relaxed text-ink">{reviewSummary}</p>
          </div>
        )}
        <ProductReviews
          productId={product.id}
          reviews={productReviews}
          averageRating={product.averageRating}
          reviewCount={product.reviewCount ?? productReviews.length}
        />
      </section>

      <RecommendationRail
        surface="pdp"
        productId={product.id}
        fallback={relatedProducts}
      />
    </div>
  );
}
