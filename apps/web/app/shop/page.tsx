import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";

export const metadata: Metadata = {
  title: "Shop — Alankara",
  description:
    "Browse handcrafted earrings, necklaces, bracelets, and clothing jewellery. Filter by category, material, and price.",
};

export default function ShopPage() {
  return <ShopPageClient />;
}
