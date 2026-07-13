"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Button } from "@/components/ui/button";
import { fetchReviews } from "@/lib/api/client";
import { API_URL } from "@/lib/api/client";
import { reviews as fixtureReviews, aiInsights } from "@/lib/fixtures";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import type { ReviewFixture } from "@/lib/fixtures/types";

export function ChapterCustomerStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [featuredReviews, setFeaturedReviews] = useState<ReviewFixture[]>(
    fixtureReviews.filter((r) => r.approved).slice(0, 3),
  );
  const [summary, setSummary] = useState(aiInsights.summary);

  useChapterReveal({ trigger: sectionRef, targets: cardsRef, variant: "fade-up", stagger: 0.12 });

  useEffect(() => {
    if (!API_URL) return;
    fetchReviews(6)
      .then((items) => {
        if (items.length > 0) setFeaturedReviews(items.slice(0, 3));
      })
      .catch(() => undefined);
    fetch(`${API_URL}/reviews/insights`)
      .then((r) => r.json())
      .then((data: { summary?: string }) => {
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-ivory px-6 py-28 md:py-36"
      aria-label="Customer stories"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">Customer stories</p>
            <h2 className="mt-5 font-display text-4xl text-maroon md:text-5xl">Worn &amp; loved</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reviews">All reviews →</Link>
          </Button>
        </div>

        <div className="mt-12 rounded-sm border border-champagne/25 bg-linen/40 p-8">
          <p className="font-body text-[10px] uppercase tracking-widest text-champagne">
            What wearers are saying
          </p>
          <p className="mt-3 font-body text-base leading-relaxed text-ink-muted">{summary}</p>
        </div>

        <div ref={cardsRef} className="mt-14 grid gap-8 md:grid-cols-3">
          {featuredReviews.map((review) => (
            <div key={review.id} data-reveal>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
