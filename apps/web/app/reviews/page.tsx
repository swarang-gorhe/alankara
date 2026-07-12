import type { Metadata } from "next";
import { ReviewsPageClient } from "@/components/reviews/ReviewsPageClient";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Reviews",
  description:
    "Read verified customer reviews. AI-powered insights, filterable luxury review cards, and stories from those who wear our craft.",
  path: "/reviews",
});

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}
