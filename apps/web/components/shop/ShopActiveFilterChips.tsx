"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { STYLE_LABELS } from "@/lib/fixtures";
import type { CategorySlug, ShopFiltersState, StyleTag } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";
import { CATEGORY_OPTIONS } from "./shop-filter-utils";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

type ShopActiveFilterChipsProps = {
  filters: ShopFiltersState;
  onChange: (filters: ShopFiltersState) => void;
  onClearAll: () => void;
  className?: string;
};

function categoryLabel(slug: CategorySlug): string {
  return CATEGORY_OPTIONS.find((c) => c.slug === slug)?.label ?? slug;
}

export function ShopActiveFilterChips({
  filters,
  onChange,
  onClearAll,
  className,
}: ShopActiveFilterChipsProps) {
  const activeCount = filters.categories.length + filters.styles.length;

  if (activeCount === 0) return null;

  const removeCategory = (slug: CategorySlug) => {
    onChange({
      ...filters,
      categories: filters.categories.filter((c) => c !== slug),
    });
  };

  const removeStyle = (style: StyleTag) => {
    onChange({
      ...filters,
      styles: filters.styles.filter((s) => s !== style),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: LUXURY_EASE }}
      className={cn("overflow-hidden", className)}
    >
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <AnimatePresence mode="popLayout">
          {filters.categories.map((slug) => (
            <motion.button
              key={`cat-${slug}`}
              layout
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: LUXURY_EASE }}
              onClick={() => removeCategory(slug)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-maroon/25 bg-maroon/8 pl-3.5 pr-2.5 font-body text-xs text-maroon transition-colors hover:border-maroon/40 hover:bg-maroon/12"
              aria-label={`Remove ${categoryLabel(slug)} filter`}
            >
              <span>{categoryLabel(slug)}</span>
              <X className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            </motion.button>
          ))}
          {filters.styles.map((style) => (
            <motion.button
              key={`style-${style}`}
              layout
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: LUXURY_EASE }}
              onClick={() => removeStyle(style)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-champagne/50 bg-champagne/10 pl-3.5 pr-2.5 font-body text-xs text-warm-brown transition-colors hover:border-champagne/70 hover:bg-champagne/18"
              aria-label={`Remove ${STYLE_LABELS[style]} filter`}
            >
              <span>{STYLE_LABELS[style]}</span>
              <X className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            </motion.button>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={onClearAll}
          className="ml-1 font-body text-[11px] uppercase tracking-[0.18em] text-ink-muted underline-offset-2 transition-colors hover:text-maroon hover:underline"
        >
          Clear all
        </button>
      </div>
    </motion.div>
  );
}
