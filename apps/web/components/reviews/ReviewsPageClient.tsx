"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { AIInsightsPanel } from "@/components/reviews/AIInsightsPanel";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { aiInsights, reviews } from "@/lib/fixtures";
import type { CategorySlug } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: { slug: CategorySlug | "all"; label: string }[] = [
  { slug: "all", label: "All" },
  { slug: "earrings", label: "Earrings" },
  { slug: "necklaces", label: "Necklaces" },
  { slug: "bracelets", label: "Bracelets" },
  { slug: "clothing-jewellery", label: "Clothing" },
];

const RATING_OPTIONS = [
  { value: 0, label: "All ratings" },
  { value: 5, label: "5 stars" },
  { value: 4, label: "4+ stars" },
];

export function ReviewsPageClient() {
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [minRating, setMinRating] = useState(0);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (!r.approved) return false;
      if (category !== "all" && r.categorySlug !== category) return false;
      if (minRating > 0 && r.rating < minRating) return false;
      return true;
    });
  }, [category, minRating]);

  const featuredReview = filteredReviews[0];
  const remainingReviews = filteredReviews.slice(1);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="font-script text-xl italic text-gold md:text-2xl">Voices of Alankara</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-maroon md:text-5xl">
          Stories from those who wear our craft
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-charcoal-muted">
          Real reviews from real moments — weddings, festivals, quiet Tuesdays dressed up.
          Every word verified; every piece linked to its story.
        </p>
      </section>

      <SectionDivider />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <AIInsightsPanel insights={aiInsights} />
      </section>

      <SectionDivider />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-maroon md:text-3xl">All reviews</h2>
            <p className="mt-2 text-sm text-charcoal-muted">
              {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="category-filter" className="sr-only">
                Filter by category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug | "all")}
                className="rounded-sm border border-gold/30 bg-cream-light px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rating-filter" className="sr-only">
                Filter by rating
              </label>
              <select
                id="rating-filter"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="rounded-sm border border-gold/30 bg-cream-light px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="rounded-sm border border-gold/20 bg-cream-light px-8 py-16 text-center">
            <p className="font-display text-xl text-maroon">No reviews match</p>
            <p className="mt-2 text-sm text-charcoal-muted">Try broadening your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {featuredReview && (
              <ReviewCard review={featuredReview} featured className="md:row-span-2" />
            )}
            {remainingReviews.map((review, i) => (
              <ReviewCard
                key={review.id}
                review={review}
                className={cn(i % 3 === 1 && "md:mt-8")}
              />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="font-script text-lg italic text-gold">
            Ready to write your own chapter?
          </p>
          <Button asChild className="mt-4">
            <Link href="/shop">Explore the collection</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
