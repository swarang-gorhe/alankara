"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { ShopChipFilters, filterProducts } from "@/components/shop/ShopChipFilters";
import { ShopEmptyState } from "@/components/shop/ShopEmptyState";
import { FabricTexture } from "@/components/ui/FabricTexture";
import type { CategorySlug, ProductFixture, ShopFiltersState } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

type ShopPageClientProps = {
  products: ProductFixture[];
};

const cardVariants = ["fold", "shadow", "thread"] as const;

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
    <div className="relative">
      <FabricTexture id="shop" className="fixed inset-0" opacity={0.04} />

      <section className="relative mx-auto max-w-7xl px-6 pb-8 pt-16 md:pt-24">
        <p className="font-script text-xl italic text-warm-brown md:text-2xl">The catalogue</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl text-maroon md:text-5xl text-balance">
          Cloth &amp; thread jewellery
        </h1>
        <p className="mt-4 max-w-2xl font-body text-ink-muted">
          An editorial collection of fabric earrings, embroidered collars, pearl-thread necklaces,
          and hair adornments — each finished by hand in small batches.
        </p>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="sticky top-20 z-20 mb-12 rounded-sm border border-sage/25 bg-ivory/90 p-4 backdrop-blur-md md:p-6">
          <ShopChipFilters
            filters={filters}
            onChange={setFilters}
            productCount={filteredProducts.length}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <ShopEmptyState />
        ) : (
          <div className="grid auto-rows-auto gap-6 md:grid-cols-4 md:gap-8">
            {filteredProducts.map((product, index) => {
              const layout =
                index % 7 === 0 ? "large" : index % 5 === 0 ? "tall" : "default";
              const variant = cardVariants[index % cardVariants.length];

              return (
                <EditorialProductCard
                  key={product.id}
                  product={product}
                  variant={variant}
                  size={layout}
                  className={cn(layout === "large" && "md:col-span-2")}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
