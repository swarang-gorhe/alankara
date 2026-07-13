"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { ShopChipFilters, filterProducts } from "@/components/shop/ShopChipFilters";
import { ShopEmptyState } from "@/components/shop/ShopEmptyState";
import type { CategorySlug, ProductFixture, ShopFiltersState } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

type ShopPageClientProps = {
  products: ProductFixture[];
};

const VALID_CATEGORIES = new Set<CategorySlug>([
  "cloth-earrings",
  "fabric-necklaces",
  "fabric-bracelets",
  "fabric-rings",
  "hair-accessories",
  "jewellery-sets",
  "embroidered-textile-jewellery",
  "sustainable-fashion-accessories",
]);

function parseCategoryParam(value: string | null): CategorySlug[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is CategorySlug => VALID_CATEGORIES.has(part as CategorySlug));
}

export function ShopPageClient({ products }: ShopPageClientProps) {
  const searchParams = useSearchParams();
  const initialCategories = parseCategoryParam(searchParams.get("category"));

  const [filters, setFilters] = useState<ShopFiltersState>({
    categories: initialCategories,
    styles: [],
    priceRange: null,
  });

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters],
  );

  return (
    <div className="relative bg-gradient-to-b from-ivory via-linen/30 to-cotton/40">
      <section className="relative border-b border-champagne/10 bg-ivory/90">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 md:pb-14 md:pt-20">
          <p className="font-script text-xl italic text-warm-brown md:text-2xl">The catalogue</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl text-maroon md:text-5xl text-balance">
            Cloth &amp; thread jewellery
          </h1>
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink-muted md:text-lg">
            Hand-finished fabric earrings, embroidered collars, pearl-thread necklaces, and hair
            adornments — photographed in natural light, one artisan batch at a time.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28">
        <div className="sticky top-16 z-20 -mx-1 mb-10 rounded-sm border border-sage/20 bg-ivory/95 px-4 py-5 shadow-luxury backdrop-blur-md md:mb-14 md:px-6 md:py-6">
          <ShopChipFilters
            filters={filters}
            onChange={setFilters}
            productCount={filteredProducts.length}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <ShopEmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <EditorialProductCard
                key={product.id}
                product={product}
                variant="shadow"
                size="default"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
