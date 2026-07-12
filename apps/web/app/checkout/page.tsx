import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout — Alankara",
  description: "Complete your Alankara order.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
