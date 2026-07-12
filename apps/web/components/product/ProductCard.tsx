"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductPlaceholder } from "@/components/product/ProductPlaceholder";
import { formatPrice } from "@/lib/fixtures";
import type { ProductFixture } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductFixture;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const image = product.images[0];
  const categoryLabel = product.categorySlug.replace("-", " ");

  return (
    <motion.article
      className={cn("group", className)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-sm border border-gold/20 bg-cream-light shadow-sm transition-shadow duration-300 group-hover:border-gold/40 group-hover:shadow-[0_8px_30px_rgba(111,35,23,0.08)]">
          <ProductPlaceholder
            name={product.name}
            image={image}
            className="transition-transform duration-500 group-hover:scale-[1.02]"
          />

          {product.featured && (
            <span className="absolute left-3 top-3 rounded-sm bg-maroon/90 px-2 py-0.5 font-body text-[10px] uppercase tracking-widest text-cream-light">
              Featured
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-xs uppercase tracking-widest text-gold">{categoryLabel}</p>
          <h3 className="font-display text-lg text-maroon transition-colors group-hover:text-maroon-light">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm text-charcoal-muted">{product.shortDescription}</p>
          <p className="pt-1 font-display text-base text-maroon">
            {formatPrice(product.minPrice)}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
