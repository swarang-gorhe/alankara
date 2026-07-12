"use client";

import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import type { ProductFixture } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductFixture;
  className?: string;
};

/** Thin wrapper — editorial card for legacy import sites */
export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <EditorialProductCard product={product} variant="shadow" className={cn(className)} />
  );
}

export { EditorialProductCard };
