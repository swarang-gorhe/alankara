import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { getShopProducts } from "@/lib/api/products";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Crafted for little moments",
  description:
    "Handmade cloth and fabric jewellery — fabric earrings, textile drops, and lightweight pieces finished in small batches.",
  path: "/",
});

export default async function Page() {
  const products = await getShopProducts();
  return <HomePage products={products} />;
}
