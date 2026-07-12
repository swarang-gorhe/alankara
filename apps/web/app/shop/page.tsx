import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { getShopProducts } from "@/lib/api/products";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Shop",
  description:
    "Browse handcrafted earrings, necklaces, bracelets, and clothing jewellery. Filter by category, material, and price.",
  path: "/shop",
});

export default async function ShopPage() {
  const products = await getShopProducts();
  return <ShopPageClient products={products} />;
}
