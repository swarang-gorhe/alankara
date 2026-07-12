import type { Metadata } from "next";
import { ReviewsPageClient } from "@/components/reviews/ReviewsPageClient";

export const metadata: Metadata = {
  title: "Reviews — Alankara",
  description:
    "Read verified customer reviews. AI-powered insights, filterable luxury review cards, and stories from those who wear our craft.",
};

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}
