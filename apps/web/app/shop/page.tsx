import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { getShopProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "Shop — Alankara",
  description:
    "Browse handcrafted earrings, necklaces, bracelets, and clothing jewellery. Filter by category, material, and price.",
};

export default async function ShopPage() {
  const products = await getShopProducts();
  return <ShopPageClient products={products} />;
}
