import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Cart — Alankara",
  description: "Review items in your Alankara shopping cart.",
};

export default function CartPage() {
  return <CartPageClient />;
}
