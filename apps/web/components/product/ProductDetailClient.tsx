"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductPlaceholder } from "@/components/product/ProductPlaceholder";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { useCart } from "@/components/providers/CartProvider";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { formatPrice, MATERIAL_LABELS } from "@/lib/fixtures";
import type { ProductFixture, ReviewFixture } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

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
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const image = product.images[0];

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

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-sm border border-gold/20">
            <ProductPlaceholder
              name={product.name}
              image={image}
              aspectRatio="portrait"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-gold">
              {product.categorySlug.replace("-", " ")}
            </p>
            <h1 className="mt-2 font-display text-4xl text-maroon md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-lg text-charcoal-muted">{product.shortDescription}</p>
            <p className="mt-6 font-display text-2xl text-maroon">
              {selectedVariant && formatPrice(selectedVariant.price.amount)}
            </p>

            {/* Variant selector — enabled when stock available */}
            {product.variants.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-xs uppercase tracking-widest text-charcoal-muted">
                  {product.variants.length > 1 ? "Select variant" : "Variant"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const variantInStock = variant.stock > 0;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={!variantInStock}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={cn(
                          "rounded-sm border px-4 py-2 text-sm transition-colors",
                          !variantInStock && "cursor-not-allowed opacity-40",
                          selectedVariantId === variant.id
                            ? "border-maroon bg-maroon text-cream-light"
                            : "border-gold/30 bg-cream-light text-charcoal hover:border-gold",
                        )}
                      >
                        {[variant.material, variant.size, variant.color]
                          .filter(Boolean)
                          .join(" · ")}
                        {!variantInStock && " (out of stock)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                disabled={!inStock || adding}
                onClick={() => void handleAddToCart()}
              >
                {adding ? "Adding…" : added ? "Added to cart" : inStock ? "Add to cart" : "Out of stock"}
              </Button>
              <Button variant="outline" disabled title="Available when wishlist is wired">
                Save to wishlist
              </Button>
            </div>
            {addError && (
              <p className="mt-3 text-xs text-maroon">{addError}</p>
            )}
            {added && (
              <p className="mt-3 text-xs text-gold">
                <Link href="/cart" className="underline underline-offset-2">
                  View cart →
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Story */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="font-display text-3xl text-maroon">The story</h2>
        <p className="mt-6 text-lg leading-relaxed text-charcoal">{product.description}</p>
      </section>

      <SectionDivider />

      {/* Materials */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-maroon">Materials</h2>
            <ul className="mt-6 space-y-3">
              {product.materials?.map((material) => (
                <li
                  key={material}
                  className="flex items-center gap-3 text-charcoal before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold-bright"
                >
                  {material}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-charcoal-muted">
              Primary: {MATERIAL_LABELS[product.primaryMaterial]}
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl text-maroon">Care</h2>
            <p className="mt-6 leading-relaxed text-charcoal-muted">
              {product.careInstructions}
            </p>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Occasion */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-3xl text-maroon">Worn for</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {product.occasion.map((occ) => (
            <span
              key={occ}
              className="rounded-sm border border-gold/30 bg-olive-linen/50 px-4 py-2 font-script text-lg italic text-maroon"
            >
              {occ}
            </span>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-3xl text-maroon">The making</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {product.process.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-sm border border-gold/20 bg-cream-light p-6"
            >
              <span className="font-display text-4xl text-gold/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-display text-xl text-maroon">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Reviews shell */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-maroon">Customer voices</h2>
            <p className="mt-2 text-sm text-charcoal-muted">
              {productReviews.length}{" "}
              {productReviews.length === 1 ? "review" : "reviews"} · AI summary in Phase 7
            </p>
          </div>
          <Link
            href="/reviews"
            className="text-xs uppercase tracking-widest text-gold hover:text-gold-bright"
          >
            All reviews →
          </Link>
        </div>

        {productReviews.length === 0 ? (
          <div className="mt-8 rounded-sm border border-gold/20 bg-cream-light px-8 py-12 text-center">
            <p className="text-charcoal-muted">No reviews yet for this piece.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {productReviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        <div className="mt-8 rounded-sm border border-dashed border-gold/30 bg-cream-light/50 px-6 py-4 text-center text-sm text-charcoal-muted">
          Per-product AI review summary — placeholder until Phase 7 LangChain integration
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <>
          <SectionDivider />
          <section className="mx-auto max-w-7xl px-6 pb-24 pt-12">
            <h2 className="font-display text-3xl text-maroon">You may also cherish</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
