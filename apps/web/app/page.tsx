import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Crafted for little moments",
  description:
    "Luxury handcrafted jewellery and adornments. Cinematic storytelling, artisan partnerships, and heirloom pieces for life's precious moments.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
