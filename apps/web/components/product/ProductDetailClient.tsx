"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FabricStitchReveal } from "@/components/product/FabricStitchReveal";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { fetchProductReviewSummary } from "@/lib/api/ai";
import { formatPrice, MATERIAL_LABELS } from "@/lib/fixtures";
import type { ProductFixture, ReviewFixture } from "@/lib/fixtures/types";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type ProductDetailClientProps = {
  product: ProductFixture;
  relatedProducts: ProductFixture[];
  productReviews: ReviewFixture[];
};

function StorySection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-4xl px-6 py-16 md:py-20", className)}>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">{title}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<string | null>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const image = product.images[0];

  useEffect(() => {
    fetchProductReviewSummary(product.slug)
      .then((data) => setReviewSummary(data?.summary ?? null))
      .catch(() => setReviewSummary(null));
  }, [product.slug]);

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionsRef.current) return;

    const sections = sectionsRef.current.querySelectorAll("[data-story-section]");
    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, sectionsRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

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
    <div className="relative">
      <FabricTexture id="product" className="fixed inset-0" opacity={0.03} />

      {/* Hero + purchase */}
      <section className="relative mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <FabricStitchReveal name={product.name} image={image} className="lg:min-h-[520px]" />

          <div className="flex flex-col justify-center">
            <p className="font-body text-xs uppercase tracking-widest text-champagne">
              {product.categorySlug.replace(/-/g, " ")}
            </p>
            <h1 className="mt-3 font-display text-4xl text-maroon md:text-5xl">{product.name}</h1>
            <p className="mt-4 font-body text-lg text-ink-muted">{product.shortDescription}</p>
            <p className="mt-6 font-display text-2xl text-maroon">
              {selectedVariant && formatPrice(selectedVariant.price.amount)}
            </p>

            {product.variants.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 font-body text-xs uppercase tracking-widest text-ink-muted">
                  {product.variants.length > 1 ? "Select variant" : "Variant"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const variantInStock = variant.stock > 0;
                    return (
                      <Chip
                        key={variant.id}
                        variant={selectedVariantId === variant.id ? "active" : "default"}
                        disabled={!variantInStock}
                        onClick={() => setSelectedVariantId(variant.id)}
                        data-magnetic
                      >
                        {[variant.material, variant.size, variant.color]
                          .filter(Boolean)
                          .join(" · ")}
                        {!variantInStock && " (out of stock)"}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                disabled={!inStock || adding}
                onClick={() => void handleAddToCart()}
                data-magnetic
              >
                {adding
                  ? "Adding…"
                  : added
                    ? "Added to cart"
                    : inStock
                      ? "Add to cart"
                      : "Out of stock"}
              </Button>
              <Button variant="outline" disabled title="Available when wishlist is wired">
                Save to wishlist
              </Button>
            </div>
            {addError && <p className="mt-3 font-body text-xs text-error">{addError}</p>}
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

      <div ref={sectionsRef}>
        <SectionDivider />

        <StorySection id="story" title="The story">
          <div data-story-section>
            <p className="font-body text-lg leading-relaxed text-ink md:text-xl">
              {product.description}
            </p>
          </div>
        </StorySection>

        <SectionDivider />

        <StorySection id="materials" title="Materials">
          <div data-story-section className="paper-card rounded-sm border border-sage/25 p-8">
            <ul className="space-y-3">
              {product.materials?.map((material) => (
                <li
                  key={material}
                  className="flex items-center gap-3 font-body text-ink before:h-1.5 before:w-1.5 before:rounded-full before:bg-champagne"
                >
                  {material}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-body text-sm text-ink-muted">
              Primary: {MATERIAL_LABELS[product.primaryMaterial]}
            </p>
          </div>
        </StorySection>

        <SectionDivider />

        <StorySection id="craft" title="How we craft">
          <div data-story-section className="grid gap-6 md:grid-cols-3">
            {product.process.map((step, index) => (
              <article
                key={step.title}
                className="rounded-sm border border-sage/25 bg-ivory p-6"
              >
                <span className="font-display text-4xl text-champagne/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-xl text-maroon">{step.title}</h3>
                <p className="mt-3 font-body text-sm text-ink-muted leading-relaxed">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </StorySection>

        <SectionDivider />

        <StorySection id="comfort" title="Comfort">
          <div data-story-section>
            <p className="font-body text-lg leading-relaxed text-ink-muted">
              {product.comfort ??
                "Lightweight fabric construction with soft backings and adjustable closures — designed for hours of comfortable wear."}
            </p>
          </div>
        </StorySection>

        <SectionDivider />

        <StorySection id="perfect-for" title="Perfect for">
          <div data-story-section className="flex flex-wrap gap-3">
            {product.occasion.map((occ) => (
              <Chip key={occ} variant="outline" className="pointer-events-none">
                {occ}
              </Chip>
            ))}
          </div>
        </StorySection>

        <SectionDivider />

        <StorySection id="packaging" title="Packaging">
          <div data-story-section className="paper-card rounded-sm border border-sage/25 p-8">
            <p className="font-body text-ink-muted leading-relaxed">
              {product.packaging ??
                "Each piece arrives wrapped in tissue, nestled in a hand-stitched cotton pouch you can reuse for travel storage."}
            </p>
          </div>
        </StorySection>

        <SectionDivider />

        <StorySection id="care" title="Care">
          <div data-story-section>
            <p className="font-body text-ink-muted leading-relaxed">{product.careInstructions}</p>
          </div>
        </StorySection>

        {reviewSummary && (
          <>
            <SectionDivider />
            <StorySection id="reviews" title="What wearers say">
              <div data-story-section className="rounded-sm border border-champagne/30 bg-cotton/50 p-6">
                <p className="font-body text-[10px] uppercase tracking-widest text-champagne">
                  AI review summary
                </p>
                <p className="mt-2 font-body text-sm leading-relaxed text-ink">{reviewSummary}</p>
              </div>
            </StorySection>
          </>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <>
          <SectionDivider />
          <section className="mx-auto max-w-7xl px-6 pb-24 pt-12">
            <h2 className="font-display text-3xl text-maroon">Related collection</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((related, index) => (
                <EditorialProductCard
                  key={related.id}
                  product={related}
                  variant={index % 3 === 0 ? "fold" : index % 3 === 1 ? "shadow" : "thread"}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
