"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuxuryImage } from "@/components/media";
import { MEDIA } from "@/lib/media";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { FilterDrawer, FloatingFilterButton } from "@/components/shop/FilterDrawer";
import { ShopEmptyState } from "@/components/shop/ShopEmptyState";
import { ShopProductGridSkeleton } from "@/components/shop/ShopProductGridSkeleton";
import { ShopActiveFilterChips } from "@/components/shop/ShopActiveFilterChips";
import type { ProductFixture, ShopFiltersState } from "@/lib/fixtures/types";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  filterProducts,
  filtersFromSearchParams,
  filtersToQueryString,
} from "./shop-filter-utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const CARD_LAYOUTS = ["portrait", "square", "square", "portrait"] as const;

type ShopPageClientProps = {
  products: ProductFixture[];
};

export function ShopPageClient({ products }: ShopPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc">("name");

  const [filters, setFilters] = useState<ShopFiltersState>(() =>
    filtersFromSearchParams(searchParams),
  );

  useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams));
    const q = searchParams.get("q");
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let list = filterProducts(products, filters);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categorySlug.includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "price_asc") return a.minPrice - b.minPrice;
      if (sortBy === "price_desc") return b.minPrice - a.minPrice;
      return a.name.localeCompare(b.name);
    });
  }, [products, filters, searchQuery, sortBy]);

  const syncUrl = useCallback(
    (next: ShopFiltersState) => {
      const query = filtersToQueryString(next);
      const href = query ? `${pathname}?${query}` : pathname;
      router.replace(href, { scroll: false });
    },
    [pathname, router],
  );

  const handleFilterChange = useCallback(
    (next: ShopFiltersState) => {
      setShowSkeleton(true);
      startTransition(() => {
        setFilters(next);
        syncUrl(next);
      });
    },
    [syncUrl],
  );

  useEffect(() => {
    if (!showSkeleton) return;
    const timer = window.setTimeout(() => setShowSkeleton(false), 280);
    return () => window.clearTimeout(timer);
  }, [showSkeleton, filteredProducts]);

  const isLoading = isPending || showSkeleton;
  const count = activeFilterCount(filters);

  return (
    <div className="relative overflow-x-hidden bg-ivory">
      <section className="relative border-b border-champagne/15">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center px-5 py-16 sm:px-8 md:py-24 lg:px-12">
            <p className="font-script text-xl italic text-warm-brown md:text-2xl">The atelier</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl text-maroon md:text-6xl text-balance">
              Handmade cloth jewellery
            </h1>
            <p className="mt-6 max-w-lg font-body text-base leading-relaxed text-ink-muted md:text-lg">
              Fabric earrings, pearl chokers, and festive sets — each piece photographed once and
              shown true. Tap any piece to open its page; try earrings and necklaces on you in
              private, on your device.
            </p>
          </div>
          <LuxuryImage
            src={MEDIA.creamFolds.src}
            alt={MEDIA.creamFolds.alt}
            width={MEDIA.creamFolds.width}
            height={MEDIA.creamFolds.height}
            fit="cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="min-h-[240px] lg:min-h-[420px]"
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8 md:pb-32">
        <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg text-maroon">
            {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search cloth jewellery…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-sage/30 bg-ivory px-4 py-2.5 font-body text-sm sm:w-56"
              aria-label="Search products"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-sm border border-sage/30 bg-ivory px-3 py-2.5 font-body text-sm"
              aria-label="Sort products"
            >
              <option value="name">Name</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>

        <ShopActiveFilterChips
          filters={filters}
          onChange={handleFilterChange}
          onClearAll={() => handleFilterChange(EMPTY_FILTERS)}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShopProductGridSkeleton count={Math.min(filteredProducts.length || 6, 6)} />
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ShopEmptyState />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-8 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-6"
            >
              {filteredProducts.map((product, index) => {
                const layout = CARD_LAYOUTS[index % CARD_LAYOUTS.length];
                return (
                  <div key={product.id} className="lg:col-span-6">
                    {index === 2 && (
                      <p className="mb-8 hidden max-w-sm font-script text-2xl italic text-warm-brown lg:block">
                        Cloth, thread, pearl — jewellery that moves like fabric.
                      </p>
                    )}
                    <EditorialProductCard product={product} layout={layout} />
                  </div>
                );
              })}
              {filteredProducts.length > 1 && (
                <div className="hidden lg:col-span-6 lg:block">
                  <LuxuryImage
                    src={MEDIA.threadWhite.src}
                    alt={MEDIA.threadWhite.alt}
                    width={MEDIA.threadWhite.width}
                    height={MEDIA.threadWhite.height}
                    fit="cover"
                    sizes="40vw"
                    className="aspect-[4/5] w-full border border-champagne/15"
                  />
                  <p className="mt-4 font-body text-[11px] uppercase tracking-[0.22em] text-olive">
                    Thread
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <FloatingFilterButton count={count} onClick={() => setDrawerOpen(true)} />
      <FilterDrawer
        filters={filters}
        onChange={handleFilterChange}
        productCount={filteredProducts.length}
        totalCount={products.length}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
