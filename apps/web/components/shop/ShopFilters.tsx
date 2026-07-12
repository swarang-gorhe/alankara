"use client";

import { cn } from "@/lib/utils";
import {
  MATERIAL_LABELS,
  PRICE_RANGES,
  type PriceRangeId,
} from "@/lib/fixtures";
import type { CategorySlug, MaterialSlug } from "@/lib/fixtures/types";

export type ShopFiltersState = {
  categories: CategorySlug[];
  materials: MaterialSlug[];
  priceRange: PriceRangeId | null;
};

type ShopFiltersProps = {
  filters: ShopFiltersState;
  onChange: (filters: ShopFiltersState) => void;
  productCount: number;
  className?: string;
};

const CATEGORY_OPTIONS: { slug: CategorySlug; label: string }[] = [
  { slug: "earrings", label: "Earrings" },
  { slug: "necklaces", label: "Necklaces" },
  { slug: "bracelets", label: "Bracelets" },
  { slug: "clothing-jewellery", label: "Clothing Jewellery" },
];

const MATERIAL_OPTIONS = Object.entries(MATERIAL_LABELS) as [MaterialSlug, string][];

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function ShopFilters({ filters, onChange, productCount, className }: ShopFiltersProps) {
  const update = (partial: Partial<ShopFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onChange({ categories: [], materials: [], priceRange: null });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.materials.length > 0 ||
    filters.priceRange !== null;

  return (
    <aside className={cn("space-y-8", className)}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl text-maroon">Refine</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs uppercase tracking-widest text-gold transition-colors hover:text-gold-bright"
          >
            Clear all
          </button>
        )}
      </div>

      <p className="text-sm text-charcoal-muted">
        {productCount} {productCount === 1 ? "piece" : "pieces"}
      </p>

      <fieldset>
        <legend className="mb-3 text-xs font-medium uppercase tracking-widest text-charcoal-muted">
          Category
        </legend>
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map(({ slug, label }) => (
            <label key={slug} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.categories.includes(slug)}
                onChange={() =>
                  update({ categories: toggleItem(filters.categories, slug) })
                }
                className="h-4 w-4 rounded-sm border-gold/40 text-maroon focus:ring-gold"
              />
              <span className="text-sm text-charcoal">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-medium uppercase tracking-widest text-charcoal-muted">
          Price
        </legend>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.id} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="price-range"
                checked={filters.priceRange === range.id}
                onChange={() => update({ priceRange: range.id })}
                className="h-4 w-4 border-gold/40 text-maroon focus:ring-gold"
              />
              <span className="text-sm text-charcoal">{range.label}</span>
            </label>
          ))}
          {filters.priceRange && (
            <button
              type="button"
              onClick={() => update({ priceRange: null })}
              className="text-xs text-gold hover:underline"
            >
              Any price
            </button>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-medium uppercase tracking-widest text-charcoal-muted">
          Material
        </legend>
        <div className="space-y-2">
          {MATERIAL_OPTIONS.map(([slug, label]) => (
            <label key={slug} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.materials.includes(slug)}
                onChange={() =>
                  update({ materials: toggleItem(filters.materials, slug) })
                }
                className="h-4 w-4 rounded-sm border-gold/40 text-maroon focus:ring-gold"
              />
              <span className="text-sm text-charcoal">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}

export function filterProducts(
  products: import("@/lib/fixtures/types").ProductFixture[],
  filters: ShopFiltersState,
) {
  return products.filter((product) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.categorySlug)
    ) {
      return false;
    }

    if (
      filters.materials.length > 0 &&
      !filters.materials.includes(product.primaryMaterial)
    ) {
      return false;
    }

    if (filters.priceRange) {
      const range = PRICE_RANGES.find((r) => r.id === filters.priceRange);
      if (range && (product.minPrice < range.min || product.minPrice > range.max)) {
        return false;
      }
    }

    return true;
  });
}
