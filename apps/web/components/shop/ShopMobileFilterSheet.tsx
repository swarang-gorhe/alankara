"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Chip } from "@/components/ui/chip";
import { SHOP_STYLE_FILTERS, STYLE_LABELS } from "@/lib/fixtures";
import type { CategorySlug, ShopFiltersState, StyleTag } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";
import { CATEGORY_OPTIONS, toggleItem } from "./shop-filter-utils";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

type ShopMobileFilterSheetProps = {
  filters: ShopFiltersState;
  onChange: (filters: ShopFiltersState) => void;
  productCount: number;
  totalCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShopMobileFilterSheet({
  filters,
  onChange,
  productCount,
  totalCount,
  open,
  onOpenChange,
}: ShopMobileFilterSheetProps) {
  const activeCount = filters.categories.length + filters.styles.length;
  const hasFilters = activeCount > 0;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const update = (partial: Partial<ShopFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onChange({ categories: [], styles: [], priceRange: null });
  };

  const countLabel =
    hasFilters && productCount !== totalCount
      ? `${productCount} of ${totalCount} match`
      : `${productCount} ${productCount === 1 ? "piece" : "pieces"}`;

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-sage/35 bg-ivory px-4 font-body text-sm text-maroon shadow-luxury transition-colors hover:border-champagne/50 md:hidden"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1.5 text-[10px] font-medium text-ivory">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-maroon/20 backdrop-blur-[2px] md:hidden"
              onClick={() => onOpenChange(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Shop filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border border-champagne/20 bg-ivory shadow-luxury-lg md:hidden"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-sage/15 px-5 py-4">
                <div>
                  <p className="font-display text-lg text-maroon">Refine your search</p>
                  <p className="mt-0.5 font-body text-xs text-ink-muted">{countLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-sage/25 text-ink-muted transition-colors hover:border-champagne/40 hover:text-maroon"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <FilterSection title="Category">
                  <div className="flex flex-wrap gap-2.5">
                    {CATEGORY_OPTIONS.map(({ slug, label }) => (
                      <Chip
                        key={slug}
                        size="lg"
                        variant={filters.categories.includes(slug) ? "active" : "default"}
                        onClick={() =>
                          update({ categories: toggleItem(filters.categories, slug) })
                        }
                        className="min-h-11"
                      >
                        {label}
                      </Chip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Style" className="mt-8">
                  <div className="flex flex-wrap gap-2.5">
                    {SHOP_STYLE_FILTERS.map((style) => (
                      <Chip
                        key={style}
                        size="lg"
                        variant={filters.styles.includes(style) ? "active" : "outline"}
                        onClick={() => update({ styles: toggleItem(filters.styles, style) })}
                        className="min-h-11"
                      >
                        {STYLE_LABELS[style]}
                      </Chip>
                    ))}
                  </div>
                </FilterSection>
              </div>

              <div className="flex shrink-0 gap-3 border-t border-sage/15 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="h-12 flex-1 rounded-full border border-sage/35 font-body text-sm text-ink-muted transition-colors hover:border-champagne/50 hover:text-maroon"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "h-12 rounded-full bg-maroon font-body text-sm text-ivory transition-opacity hover:opacity-90",
                    hasFilters ? "flex-[1.5]" : "w-full",
                  )}
                >
                  Show {productCount} {productCount === 1 ? "piece" : "pieces"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-3 font-body text-[11px] uppercase tracking-[0.2em] text-olive">{title}</p>
      {children}
    </div>
  );
}
