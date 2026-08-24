"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Chip } from "@/components/ui/chip";
import {
  COLOR_OPTIONS,
  COLLECTION_OPTIONS,
  EARRING_SIZES,
  MATERIAL_LABELS,
  PRICE_RANGES,
  SHOP_MATERIAL_FILTERS,
  SHOP_STYLE_FILTERS,
  STYLE_LABELS,
} from "@/lib/fixtures";
import type { ShopFiltersState } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";
import {
  CATEGORY_OPTIONS,
  EMPTY_FILTERS,
  activeFilterCount,
  toggleItem,
} from "./shop-filter-utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type FilterDrawerProps = {
  filters: ShopFiltersState;
  onChange: (filters: ShopFiltersState) => void;
  productCount: number;
  totalCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="border-b border-champagne/15 py-6"
    >
      <p className="mb-3 font-body text-[11px] uppercase tracking-[0.28em] text-olive">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </motion.section>
  );
}

export function FilterDrawer({
  filters,
  onChange,
  productCount,
  totalCount,
  open,
  onOpenChange,
}: FilterDrawerProps) {
  const count = activeFilterCount(filters);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const update = (partial: Partial<ShopFiltersState>) => onChange({ ...filters, ...partial });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100vw,28rem)] flex-col border-l border-champagne/20 bg-ivory shadow-luxury-lg"
          >
            <header className="flex items-center justify-between border-b border-champagne/15 px-6 py-5">
              <div>
                <h2 id="filter-drawer-title" className="font-display text-2xl text-maroon">
                  Refine
                </h2>
                <p className="mt-1 font-body text-xs text-ink-muted">
                  {productCount} of {totalCount} pieces
                  {count > 0 ? ` · ${count} selected` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-10 w-10 items-center justify-center text-maroon"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-8">
              <Section title="Category">
                {CATEGORY_OPTIONS.map(({ slug, label }) => (
                  <Chip
                    key={slug}
                    variant={filters.categories.includes(slug) ? "active" : "default"}
                    onClick={() => update({ categories: toggleItem(filters.categories, slug) })}
                  >
                    {label}
                  </Chip>
                ))}
              </Section>
              <Section title="Material">
                {SHOP_MATERIAL_FILTERS.map((material) => (
                  <Chip
                    key={material}
                    variant={(filters.materials ?? []).includes(material) ? "active" : "outline"}
                    onClick={() =>
                      update({ materials: toggleItem(filters.materials ?? [], material) })
                    }
                  >
                    {MATERIAL_LABELS[material]}
                  </Chip>
                ))}
              </Section>
              <Section title="Color">
                {COLOR_OPTIONS.map((color) => (
                  <Chip
                    key={color}
                    variant={(filters.colors ?? []).includes(color) ? "active" : "outline"}
                    onClick={() => update({ colors: toggleItem(filters.colors ?? [], color) })}
                  >
                    {color}
                  </Chip>
                ))}
              </Section>
              <Section title="Style">
                {SHOP_STYLE_FILTERS.map((style) => (
                  <Chip
                    key={style}
                    variant={filters.styles.includes(style) ? "active" : "outline"}
                    onClick={() => update({ styles: toggleItem(filters.styles, style) })}
                  >
                    {STYLE_LABELS[style]}
                  </Chip>
                ))}
              </Section>
              <Section title="Price">
                {PRICE_RANGES.map((range) => (
                  <Chip
                    key={range.id}
                    variant={filters.priceRange === range.id ? "active" : "outline"}
                    onClick={() =>
                      update({ priceRange: filters.priceRange === range.id ? null : range.id })
                    }
                  >
                    {range.label}
                  </Chip>
                ))}
              </Section>
              <Section title="Availability">
                <Chip
                  variant={filters.availability === "in-stock" ? "active" : "outline"}
                  onClick={() =>
                    update({
                      availability: filters.availability === "in-stock" ? "all" : "in-stock",
                    })
                  }
                >
                  In stock
                </Chip>
              </Section>
              <Section title="Collection">
                {COLLECTION_OPTIONS.map((collection) => (
                  <Chip
                    key={collection.id}
                    variant={(filters.collections ?? []).includes(collection.id) ? "active" : "outline"}
                    onClick={() =>
                      update({
                        collections: toggleItem(filters.collections ?? [], collection.id),
                      })
                    }
                  >
                    {collection.label}
                  </Chip>
                ))}
                {EARRING_SIZES.map((size) => (
                  <Chip
                    key={size}
                    variant={filters.sizes.includes(size) ? "active" : "default"}
                    onClick={() => update({ sizes: toggleItem(filters.sizes, size) })}
                  >
                    {size}
                  </Chip>
                ))}
              </Section>
            </div>

            <footer className="flex gap-3 border-t border-champagne/15 px-6 py-4">
              <button
                type="button"
                onClick={() => onChange(EMPTY_FILTERS)}
                className="font-body text-xs uppercase tracking-[0.2em] text-ink-muted hover:text-maroon"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="ml-auto rounded-sm bg-maroon px-6 py-2.5 font-body text-sm text-ivory"
              >
                View {productCount} {productCount === 1 ? "piece" : "pieces"}
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function FloatingFilterButton({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-ivory/95 px-5 py-3 font-body text-sm text-maroon shadow-luxury backdrop-blur-md",
        className,
      )}
      aria-haspopup="dialog"
    >
      <span className="font-display tracking-wide">Filter</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1.5 text-[10px] text-ivory">
          {count}
        </span>
      )}
    </button>
  );
}
