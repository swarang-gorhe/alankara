"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import {
  ShopFilters,
  filterProducts,
  type ShopFiltersState,
} from "@/components/shop/ShopFilters";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { products } from "@/lib/fixtures";

export function ShopPageClient() {
  const [filters, setFilters] = useState<ShopFiltersState>({
    categories: [],
    materials: [],
    priceRange: null,
  });

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [filters],
  );

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="font-script text-xl italic text-gold md:text-2xl">The Collection</p>
        <h1 className="mt-4 font-display text-4xl text-maroon md:text-5xl">
          Shop handcrafted adornments
        </h1>
        <p className="mt-4 max-w-2xl text-charcoal-muted">
          Each piece is finished by artisan hands — explore by category, material, or
          price. Product photography arrives in Phase 4; placeholders mark pieces awaiting
          their portrait.
        </p>
      </section>

      <SectionDivider />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="lg:w-64 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <ShopFilters
                filters={filters}
                onChange={setFilters}
                productCount={filteredProducts.length}
              />
            </div>
          </div>

          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="rounded-sm border border-gold/20 bg-cream-light px-8 py-16 text-center">
                <p className="font-display text-xl text-maroon">No pieces match</p>
                <p className="mt-2 text-sm text-charcoal-muted">
                  Try adjusting your filters to discover more of the collection.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
