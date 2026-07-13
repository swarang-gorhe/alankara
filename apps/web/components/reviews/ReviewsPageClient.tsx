"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { AIInsightsPanel } from "@/components/reviews/AIInsightsPanel";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { fetchReviewInsights } from "@/lib/api/ai";
import { fetchReviews } from "@/lib/api/client";
import { aiInsights, reviews as fixtureReviews } from "@/lib/fixtures";
import type { AIInsightsFixture, CategorySlug, ReviewFixture } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: { slug: CategorySlug | "all"; label: string }[] = [
  { slug: "all", label: "All" },
  { slug: "cloth-earrings", label: "Earrings" },
  { slug: "fabric-necklaces", label: "Necklaces" },
  { slug: "fabric-bracelets", label: "Bracelets" },
  { slug: "hair-accessories", label: "Hair" },
  { slug: "jewellery-sets", label: "Sets" },
  { slug: "embroidered-textile-jewellery", label: "Textile" },
];

const RATING_OPTIONS = [
  { value: 0, label: "All ratings" },
  { value: 5, label: "5 stars" },
  { value: 4, label: "4+ stars" },
];

export function ReviewsPageClient() {
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [minRating, setMinRating] = useState(0);
  const [insights, setInsights] = useState<AIInsightsFixture>(aiInsights);
  const [reviews, setReviews] = useState<ReviewFixture[]>(fixtureReviews);

  useEffect(() => {
    fetchReviewInsights()
      .then(setInsights)
      .catch(() => setInsights(aiInsights));

    fetchReviews()
      .then(setReviews)
      .catch(() => setReviews(fixtureReviews));
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (!r.approved) return false;
      if (category !== "all" && r.categorySlug !== category) return false;
      if (minRating > 0 && r.rating < minRating) return false;
      return true;
    });
  }, [category, minRating, reviews]);

  const featuredReview = filteredReviews[0];
  const remainingReviews = filteredReviews.slice(1);

  return (
    <div className="bg-gradient-to-b from-ivory via-linen/30 to-cotton/40">
      <section className="border-b border-champagne/10 bg-ivory/90">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-24">
          <p className="font-script text-xl italic text-champagne md:text-2xl">Voices of Alankara</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-maroon md:text-5xl">
            Stories from those who wear our craft
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Real reviews from real moments — festivals, gatherings, quiet Tuesdays dressed up.
            Every word verified; every piece linked to its story.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <AIInsightsPanel insights={insights} />
      </section>

      <SectionDivider />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-maroon md:text-3xl">All reviews</h2>
            <p className="mt-2 font-body text-sm text-ink-muted">
              {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <Chip
                key={opt.slug}
                variant={category === opt.slug ? "active" : "outline"}
                onClick={() => setCategory(opt.slug)}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {RATING_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              variant={minRating === opt.value ? "active" : "default"}
              onClick={() => setMinRating(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="rounded-sm border border-sage/25 bg-ivory px-8 py-16 text-center shadow-luxury">
            <p className="font-display text-xl text-maroon">No reviews match</p>
            <p className="mt-2 text-sm text-ink-muted">Try broadening your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            {featuredReview && (
              <ReviewCard review={featuredReview} featured className="lg:col-span-5 lg:row-span-2" />
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
              {remainingReviews.map((review, i) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  className={cn(i % 3 === 1 && "sm:mt-4")}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="font-script text-lg italic text-champagne md:text-xl">
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
