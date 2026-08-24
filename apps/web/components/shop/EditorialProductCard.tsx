"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductStill } from "@/components/media";
import { TryOnButton } from "@/components/try-on/TryOnButton";
import { formatPrice, getProductSize } from "@/lib/fixtures";
import type { ProductFixture } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

type EditorialProductCardProps = {
  product: ProductFixture;
  variant?: "fold" | "shadow" | "thread";
  className?: string;
  size?: "default" | "large" | "tall";
  layout?: "square" | "portrait" | "wide" | "feature";
};

const layoutAspect = {
  square: "square",
  portrait: "portrait",
  wide: "landscape",
  feature: "portrait",
} as const;

export function EditorialProductCard({
  product,
  className,
  size = "default",
  layout = "square",
}: EditorialProductCardProps) {
  const image = product.images[0];
  const categoryLabel = product.categorySlug.replace(/-/g, " ");
  const sizeLabel = getProductSize(product);
  const aspect = layoutAspect[layout];

  return (
    <article className={cn("group relative min-w-0", size === "large" && "md:col-span-2", className)}>
      <Link href={`/product/${product.slug}`} className="block" data-cursor-sparkle>
        <motion.div
          className="relative overflow-hidden border border-champagne/20 bg-ivory"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductStill
            name={product.name}
            slug={product.slug}
            image={image}
            aspect={aspect}
            hoverZoom
            priority={product.featured && layout === "feature"}
            sizes={
              layout === "feature"
                ? "(max-width: 768px) 100vw, 60vw"
                : "(max-width: 768px) 50vw, 25vw"
            }
            className={layout === "feature" ? "min-h-[240px] md:min-h-[320px]" : undefined}
          />

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-ivory via-ivory/90 to-transparent px-4 pb-4 pt-12 opacity-0 transition-all duration-base ease-luxury group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden
          >
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-maroon">View piece</p>
          </div>
        </motion.div>

        <div className="mt-4 space-y-1.5 px-0.5">
          <p className="font-body text-[10px] uppercase tracking-[0.22em] text-champagne">
            {categoryLabel}
            {sizeLabel ? ` · ${sizeLabel}` : ""}
          </p>
          <h3 className="font-display text-lg leading-snug text-maroon md:text-xl">{product.name}</h3>
          <p className="line-clamp-2 hidden font-body text-sm leading-relaxed text-ink-muted sm:block">
            {product.shortDescription}
          </p>
          <p className="pt-1 font-display text-lg text-maroon">{formatPrice(product.minPrice)}</p>
          {typeof product.averageRating === "number" && (product.reviewCount ?? 0) > 0 && (
            <p className="font-body text-[11px] uppercase tracking-widest text-ink-muted">
              {product.averageRating.toFixed(1)} · {product.reviewCount} notes
            </p>
          )}
          {product.variants.every((v) => v.stock <= 0) && (
            <p className="font-body text-[11px] uppercase tracking-widest text-maroon">Resting</p>
          )}
        </div>
      </Link>
      <div className="absolute right-2 top-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        <TryOnButton product={product} variant="card" label="Try on" />
      </div>
    </article>
  );
}
