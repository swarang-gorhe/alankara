"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Chip } from "@/components/ui/chip";
import { PRICE_RANGES, SHOP_STYLE_FILTERS, STYLE_LABELS } from "@/lib/fixtures";
import type { ShopFiltersState } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";
import { ShopActiveFilterChips } from "./ShopActiveFilterChips";
import { ShopMobileFilterSheet } from "./ShopMobileFilterSheet";
import { CATEGORY_OPTIONS, toggleItem } from "./shop-filter-utils";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

type ShopChipFiltersProps = {
  filters: ShopFiltersState;
  onChange: (filters: ShopFiltersState) => void;
  productCount: number;
  totalCount: number;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  className?: string;
};

export function ShopChipFilters({
  filters,
  onChange,
  productCount,
  totalCount,
  mobileOpen,
  onMobileOpenChange,
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

  const countLabel = hasActive
    ? productCount === 1
      ? "1 piece matches"
      : `${productCount} pieces match`
    : productCount === 1
      ? "1 piece"
      : `${productCount} pieces`;

  return (
    <div className={cn("space-y-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.p
          key={countLabel}
          initial={{ opacity: 0.6, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: LUXURY_EASE }}
          className="font-display text-sm text-maroon md:text-base"
        >
          {countLabel}
        </motion.p>

        <div className="flex items-center gap-3">
          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="hidden font-body text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-maroon md:inline"
            >
              Clear all
            </button>
          )}
          <ShopMobileFilterSheet
            filters={filters}
            onChange={onChange}
            productCount={productCount}
            totalCount={totalCount}
            open={mobileOpen}
            onOpenChange={onMobileOpenChange}
          />
        </div>
      </div>

      <AnimatePresence>
        {hasActive && (
          <ShopActiveFilterChips
            filters={filters}
            onChange={onChange}
            onClearAll={clearAll}
            className="md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="hidden md:block">
        <div className="relative mt-4">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-ivory/95 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-ivory/95 to-transparent"
            aria-hidden
          />
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 self-center pr-1 font-body text-[10px] uppercase tracking-[0.2em] text-olive">
              Category
            </span>
            {CATEGORY_OPTIONS.map(({ slug, label }) => {
              const active = filters.categories.includes(slug);
              return (
                <motion.div
                  key={slug}
                  layout
                  initial={false}
                  animate={{ scale: active ? 1.02 : 1 }}
                  transition={{ duration: 0.25, ease: LUXURY_EASE }}
                  className="shrink-0"
                >
                  <Chip
                    variant={active ? "active" : "default"}
                    onClick={() => update({ categories: toggleItem(filters.categories, slug) })}
                    data-magnetic
                    className="whitespace-nowrap"
                  >
                    {label}
                  </Chip>
                </motion.div>
              );
            })}

            <span
              className="mx-1 shrink-0 self-center text-champagne/40"
              aria-hidden
            >
              |
            </span>

            <span className="shrink-0 self-center pr-1 font-body text-[10px] uppercase tracking-[0.2em] text-olive">
              Style
            </span>
            {SHOP_STYLE_FILTERS.map((style) => {
              const active = filters.styles.includes(style);
              return (
                <motion.div
                  key={style}
                  layout
                  initial={false}
                  animate={{ scale: active ? 1.02 : 1 }}
                  transition={{ duration: 0.25, ease: LUXURY_EASE }}
                  className="shrink-0"
                >
                  <Chip
                    variant={active ? "active" : "outline"}
                    onClick={() => update({ styles: toggleItem(filters.styles, style) })}
                    data-magnetic
                    className="whitespace-nowrap"
                  >
                    {STYLE_LABELS[style]}
                  </Chip>
                </motion.div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {hasActive && (
            <ShopActiveFilterChips
              filters={filters}
              onChange={onChange}
              onClearAll={clearAll}
            />
          )}
        </AnimatePresence>
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
