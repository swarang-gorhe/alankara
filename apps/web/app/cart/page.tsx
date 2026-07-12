import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cart",
  description: "Review items in your Alankara shopping cart.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
