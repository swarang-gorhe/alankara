"use client";

import { motion } from "framer-motion";
import { Chip } from "@/components/ui/chip";
import { PRICE_RANGES, SHOP_STYLE_FILTERS, STYLE_LABELS } from "@/lib/fixtures";
import type { CategorySlug, ShopFiltersState, StyleTag } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: { slug: CategorySlug; label: string }[] = [
  { slug: "earrings", label: "Earrings" },
  { slug: "necklaces", label: "Necklaces" },
  { slug: "bracelets", label: "Bracelets" },
  { slug: "rings", label: "Rings" },
  { slug: "hair-accessories", label: "Hair" },
  { slug: "sets", label: "Sets" },
  { slug: "embroidered-textile", label: "Textile" },
];

type ShopChipFiltersProps = {
  filters: ShopFiltersState;
  onChange: (filters: ShopFiltersState) => void;
  productCount: number;
  className?: string;
};

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function ShopChipFilters({
  filters,
  onChange,
  productCount,
  className,
}: ShopChipFiltersProps) {
  const update = (partial: Partial<ShopFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onChange({ categories: [], styles: [], priceRange: null });
  };

  const hasActive =
    filters.categories.length > 0 || filters.styles.length > 0 || filters.priceRange !== null;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-body text-sm text-ink-muted">
          {productCount} {productCount === 1 ? "piece" : "pieces"}
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="font-body text-xs uppercase tracking-widest text-champagne transition-colors hover:text-warm-brown"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="mb-3 font-body text-xs uppercase tracking-widest text-olive">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(({ slug, label }) => (
            <motion.div
              key={slug}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Chip
                variant={filters.categories.includes(slug) ? "active" : "default"}
                onClick={() => update({ categories: toggleItem(filters.categories, slug) })}
                data-magnetic
              >
                {label}
              </Chip>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 font-body text-xs uppercase tracking-widest text-olive">Style</p>
        <div className="flex flex-wrap gap-2">
          {SHOP_STYLE_FILTERS.map((style) => (
            <motion.div
              key={style}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Chip
                variant={filters.styles.includes(style) ? "active" : "outline"}
                onClick={() => update({ styles: toggleItem(filters.styles, style) })}
                data-magnetic
              >
                {STYLE_LABELS[style]}
              </Chip>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
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
      filters.styles.length > 0 &&
      !filters.styles.some((style) => product.styleTags.includes(style))
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
