import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { ShopProductGridSkeleton } from "@/components/shop/ShopProductGridSkeleton";
import { getShopProducts } from "@/lib/api/products";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Shop",
  description:
    "Browse handmade cloth earrings, embroidered textile jewellery, pearl-thread necklaces, and cotton hair adornments.",
  path: "/shop",
});

export default async function ShopPage() {
  const products = await getShopProducts();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <ShopProductGridSkeleton />
        </div>
      }
    >
      <ShopPageClient products={products} />
    </Suspense>
  );
}
