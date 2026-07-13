import type { Metadata } from "next";
import { AccountPageClient } from "@/components/account/AccountPageClient";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "My Account",
  description: "Manage your Alankara orders, wishlist, addresses, and profile.",
  path: "/account",
});

export default function AccountPage() {
  return <AccountPageClient />;
}
