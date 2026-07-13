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
  variant = "shadow",
  className,
  size = "default",
}: EditorialProductCardProps) {
  const image = product.images[0];
  const categoryLabel = product.categorySlug.replace(/-/g, " ");

  return (
    <motion.article
      className={cn("group", sizeClasses[size], className)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/product/${product.slug}`} className="block" data-cursor-sparkle>
        <div
          className={cn(
            "relative overflow-hidden rounded-sm border border-sage/20 bg-ivory transition-all duration-base ease-luxury",
            variant === "shadow" && "group-hover:border-champagne/35 group-hover:shadow-luxury-lg",
            variant === "fold" && "group-hover:rounded-[1.5rem_1.5rem_0.25rem_0.25rem] group-hover:shadow-luxury-lg",
            variant === "thread" &&
              "group-hover:border-champagne/45 before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-0.5 before:origin-left before:scale-x-0 before:bg-champagne before:transition-transform before:duration-slow group-hover:before:scale-x-100",
          )}
        >
          <ProductPlaceholder
            name={product.name}
            image={image}
            aspectRatio={size === "tall" ? "portrait" : size === "large" ? "landscape" : "square"}
            className="transition-transform duration-slow ease-luxury group-hover:scale-[1.03]"
          />

          {product.featured && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-maroon/92 px-2.5 py-0.5 font-body text-[10px] uppercase tracking-widest text-ivory shadow-luxury">
              Featured
            </span>
          )}
        </div>

        <div className="mt-3 space-y-0.5 px-0.5 md:mt-4">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-champagne md:text-xs">
            {categoryLabel}
          </p>
          <h3 className="font-display text-base leading-snug text-maroon transition-colors group-hover:text-warm-brown md:text-lg">
            {product.name}
          </h3>
          <p className="line-clamp-2 hidden font-body text-sm text-ink-muted sm:block">
            {product.shortDescription}
          </p>
          <p className="pt-1 font-display text-sm text-maroon md:text-base">
            {formatPrice(product.minPrice)}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
