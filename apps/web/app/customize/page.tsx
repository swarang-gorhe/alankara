import type { Metadata } from "next";
import { CustomizeClient } from "@/components/customize/CustomizeClient";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Customize",
  description:
    "Choose your fabric, shape and details — Alankara will handcraft your cloth jewellery.",
  path: "/customize",
});

export default function CustomizePage() {
  return <CustomizeClient />;
}
