"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EditorialFrame } from "@/components/editorial";
import { GoldDivider, PromotionalBanner } from "@/components/decor";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { ShopChipFilters, filterProducts } from "@/components/shop/ShopChipFilters";
import { ShopEmptyState } from "@/components/shop/ShopEmptyState";
import { ShopProductGridSkeleton } from "@/components/shop/ShopProductGridSkeleton";
import type { ProductFixture, ShopFiltersState } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";
import { filtersFromSearchParams, filtersToQueryString } from "./shop-filter-utils";

type ShopPageClientProps = {
  products: ProductFixture[];
};

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export function ShopPageClient({ products }: ShopPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc">("name");

  const [filters, setFilters] = useState<ShopFiltersState>(() =>
    filtersFromSearchParams(searchParams),
  );

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
    const fromUrl = filtersFromSearchParams(searchParams);
    setFilters(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (!showSkeleton) return;
    const timer = window.setTimeout(() => setShowSkeleton(false), 280);
    return () => window.clearTimeout(timer);
  }, [showSkeleton, filteredProducts]);

  const isLoading = isPending || showSkeleton;

  return (
    <div className="relative overflow-hidden bg-ivory">
      <section className="relative border-b border-champagne/15">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center px-4 py-14 sm:px-6 md:py-20 lg:px-10">
            <p className="font-script text-xl italic text-warm-brown md:text-2xl">The catalogue</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl text-maroon md:text-5xl text-balance">
              Cloth &amp; thread jewellery
            </h1>
            <GoldDivider width="md" className="my-6" />
            <p className="max-w-lg font-body text-base leading-relaxed text-ink-muted md:text-lg">
              Fabric earrings, embroidered collars, pearl-thread necklaces, and hair adornments —
              photographed in natural light, one small batch at a time.
            </p>
          </div>
          <EditorialFrame
            src="/editorial/cotton-pouch.webp"
            alt="Alankara cotton drawstring pouch in kraft gift packaging"
            caption="Sealed with care"
            className="min-h-[280px] rounded-none border-0 border-l border-champagne/15 shadow-none lg:min-h-[360px]"
            imageClassName="min-h-[280px] lg:min-h-[360px]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            vignette="bottom"
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-sm border border-champagne/20 bg-linen/30 p-5">
              <p className="font-display text-sm text-maroon">Filter</p>
              <ShopChipFilters
                filters={filters}
                onChange={handleFilterChange}
                productCount={filteredProducts.length}
                totalCount={products.length}
                mobileOpen={false}
                onMobileOpenChange={setMobileFiltersOpen}
              />
            </div>
          </aside>

          <div>
        {/* Mobile + tablet filter strip */}
        <div
          className={cn(
            "sticky top-16 z-20 -mx-1 mb-8 space-y-4 rounded-sm border border-champagne/25 px-4 py-4 shadow-luxury backdrop-blur-md md:top-[4.25rem] md:mb-12 md:px-6 md:py-5 lg:hidden",
            "bg-ivory/95",
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              placeholder="Search cloth jewellery…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-sm border border-sage/30 bg-ivory px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink-muted focus:border-champagne focus:outline-none"
              aria-label="Search products"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-sm border border-sage/30 bg-ivory px-3 py-2.5 font-body text-sm text-ink"
              aria-label="Sort products"
            >
              <option value="name">Name</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
          <ShopChipFilters
            filters={filters}
            onChange={handleFilterChange}
            productCount={filteredProducts.length}
            totalCount={products.length}
            mobileOpen={mobileFiltersOpen}
            onMobileOpenChange={setMobileFiltersOpen}
          />
        </div>

        <PromotionalBanner className="mb-10" />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: LUXURY_EASE }}
            >
              <ShopProductGridSkeleton count={Math.min(filteredProducts.length || 8, 8)} />
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
            >
              <ShopEmptyState />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12 lg:grid-cols-4"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.04, 0.24),
                    ease: LUXURY_EASE,
                  }}
                >
                  <EditorialProductCard
                    product={product}
                    variant="shadow"
                    size="default"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
