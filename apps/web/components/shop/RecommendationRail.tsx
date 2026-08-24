"use client";

import { useEffect, useState } from "react";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { fetchRecommendations } from "@/lib/api/commerce";
import type { ProductFixture } from "@/lib/fixtures/types";

type RecommendationRailProps = {
  surface: "home" | "pdp";
  productId?: string;
  fallback?: ProductFixture[];
  className?: string;
};

export function RecommendationRail({
  surface,
  productId,
  fallback = [],
  className,
}: RecommendationRailProps) {
  const [headline, setHeadline] = useState(
    surface === "pdp" ? "You may also like" : "Picked for you",
  );
  const [items, setItems] = useState<ProductFixture[]>(fallback);

  useEffect(() => {
    let cancelled = false;
    fetchRecommendations({ surface, productId, limit: 6 })
      .then((data) => {
        if (cancelled) return;
        if (data.items.length > 0) {
          setItems(data.items);
          setHeadline(data.headline);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [surface, productId]);

  if (items.length === 0) return null;

  return (
    <section className={className ?? "mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 md:pb-28"}>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">Selected for this visit</p>
      <h2 className="mt-2 font-display text-3xl text-maroon">{headline}</h2>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
        {items.map((product) => (
          <EditorialProductCard key={product.id} product={product} variant="thread" />
        ))}
      </div>
    </section>
  );
}
