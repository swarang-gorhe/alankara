"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BotanicalSprig, GoldDivider, PaperTexture, PearlScatter, PromotionalBanner } from "@/components/decor";
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

  const [filters, setFilters] = useState<ShopFiltersState>(() =>
    filtersFromSearchParams(searchParams),
  );

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters],
  );

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
    <div className="relative overflow-hidden">
      <PaperTexture variant="cream" />

      {/* Hero banner with pearl + botanical framing */}
      <section className="relative border-b border-champagne/15">
        <PearlScatter density="medium" corners="top" className="z-[1]" />
        <BotanicalSprig position="top-left" size={100} className="z-[1] opacity-80" />
        <BotanicalSprig position="top-right" size={100} className="z-[1] opacity-80" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 md:pb-16 md:pt-20">
          <p className="text-center font-script text-xl italic text-warm-brown md:text-left md:text-2xl">
            The catalogue
          </p>
          <h1 className="mt-3 max-w-3xl text-center font-display text-4xl text-maroon md:text-left md:text-5xl text-balance">
            Cloth &amp; thread jewellery
          </h1>
          <GoldDivider width="md" className="mx-auto my-6 md:mx-0" />
          <p className="mx-auto max-w-2xl text-center font-body text-base leading-relaxed text-ink-muted md:mx-0 md:text-left md:text-lg">
            Hand-finished fabric earrings, embroidered collars, pearl-thread necklaces, and hair
            adornments — photographed in natural light, one artisan batch at a time.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28">
        {/* Champagne gold tinted filter strip */}
        <div
          className={cn(
            "sticky top-[4.5rem] z-20 -mx-1 mb-8 rounded-sm border border-champagne/25 px-4 py-4 shadow-luxury backdrop-blur-md transition-shadow duration-base ease-luxury md:top-20 md:mb-12 md:px-6 md:py-5",
            "bg-gradient-to-r from-champagne/12 via-ivory/95 to-champagne/12",
            "supports-[backdrop-filter]:from-champagne/10 supports-[backdrop-filter]:via-ivory/92",
          )}
        >
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
      </section>
    </div>
  );
}
