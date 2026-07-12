"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductPlaceholder } from "@/components/product/ProductPlaceholder";
import { formatPrice } from "@/lib/fixtures";
import type { ProductFixture } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

type EditorialProductCardProps = {
  product: ProductFixture;
  variant?: "fold" | "shadow" | "thread";
  className?: string;
  size?: "default" | "large" | "tall";
};

const sizeClasses = {
  default: "",
  large: "md:col-span-2",
  tall: "md:row-span-2",
};

export function EditorialProductCard({
  product,
  variant = "fold",
  className,
  size = "default",
}: EditorialProductCardProps) {
  const image = product.images[0];
  const categoryLabel = product.categorySlug.replace(/-/g, " ");

  return (
    <motion.article
      className={cn("group", sizeClasses[size], className)}
      whileHover={{ y: variant === "shadow" ? -6 : -2 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/product/${product.slug}`} className="block" data-cursor-sparkle>
        <div
          className={cn(
            "relative overflow-hidden border border-sage/30 bg-ivory transition-all duration-slow ease-luxury",
            variant === "fold" && "rounded-sm group-hover:rounded-[2rem_2rem_0.25rem_0.25rem]",
            variant === "shadow" && "rounded-[1.5rem] group-hover:shadow-luxury-lg",
            variant === "thread" && "rounded-sm",
            variant === "fold" &&
              "group-hover:border-champagne/40 group-hover:shadow-luxury-lg",
            variant === "shadow" && "group-hover:border-champagne/30",
            variant === "thread" &&
              "group-hover:border-champagne/50 before:absolute before:inset-x-0 before:top-0 before:h-1 before:origin-left before:scale-x-0 before:bg-champagne before:transition-transform before:duration-slow before:ease-luxury group-hover:before:scale-x-100",
          )}
        >
          <ProductPlaceholder
            name={product.name}
            image={image}
            aspectRatio={size === "tall" ? "portrait" : size === "large" ? "landscape" : "square"}
            className={cn(
              "transition-transform duration-slow ease-luxury",
              variant === "fold" && "group-hover:scale-[1.03]",
              variant === "shadow" && "group-hover:scale-[1.02]",
              variant === "thread" && "group-hover:-translate-y-1",
            )}
          />

          {variant === "thread" && (
            <div
              className="pointer-events-none absolute bottom-4 right-4 flex gap-1 opacity-0 transition-opacity duration-base group-hover:opacity-100"
              aria-hidden="true"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-champagne/70" />
              <span className="h-1 w-1 rounded-full bg-champagne/50" />
              <span className="h-0.5 w-0.5 rounded-full bg-champagne/40" />
            </div>
          )}

          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-maroon/90 px-2.5 py-0.5 font-body text-[10px] uppercase tracking-widest text-ivory">
              Featured
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1 px-1">
          <p className="font-body text-xs uppercase tracking-widest text-champagne">
            {categoryLabel}
          </p>
          <h3 className="font-display text-lg text-maroon transition-colors group-hover:text-warm-brown">
            {product.name}
          </h3>
          <p className="line-clamp-2 font-body text-sm text-ink-muted">
            {product.shortDescription}
          </p>
          <p className="pt-1 font-display text-base text-maroon">
            {formatPrice(product.minPrice)}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
