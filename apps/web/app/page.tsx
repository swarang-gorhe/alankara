import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Crafted for little moments",
  description:
    "Handmade cloth and fabric jewellery — embroidered earrings, pearl-thread necklaces, cotton hair adornments, and wearable art for everyday moments.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
