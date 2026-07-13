"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Button } from "@/components/ui/button";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { aiInsights, reviews } from "@/lib/fixtures";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";

const featuredReviews = reviews.filter((r) => r.approved).slice(0, 3);

export function ChapterCustomerStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [summary] = useState(aiInsights.summary);
  const prefersReducedMotion = usePrefersReducedMotion();

  useChapterReveal({ trigger: sectionRef, targets: cardsRef, variant: "fade-up", stagger: 0.18 });

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll("[data-review-card]");
    const ctx = gsap.context(() => {
      cards.forEach((card, index) => {
        gsap.to(card, {
          y: index % 2 === 0 ? -12 : 12,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-ivory via-linen/40 to-sage/10 px-6 py-24 md:py-32"
      aria-label="Customer stories"
    >
      <FabricTexture id="reviews" opacity={0.04} />

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">Customer stories</p>
            <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">Worn &amp; loved</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reviews">All reviews →</Link>
          </Button>
        </div>

        <div className="paper-card mt-10 rounded-sm border border-champagne/30 p-6 md:p-8">
          <p className="font-body text-[10px] uppercase tracking-widest text-champagne">
            What wearers are saying
          </p>
          <p className="mt-3 font-body text-sm text-ink leading-relaxed md:text-base">{summary}</p>
        </div>

        <div ref={cardsRef} className="mt-12 grid gap-6 md:grid-cols-3">
          {featuredReviews.map((review) => (
            <div key={review.id} data-reveal data-review-card>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
