"use client";

import Image from "next/image";
import { useRef } from "react";
import { PROCESS_STEPS } from "@/lib/editorial/story-images";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { cn } from "@/lib/utils";

/** Process chapter — sequential editorial frames instead of emoji cards */
export function ChapterThreadToTreasure() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "mask-left", stagger: 0.12 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-cotton/60 px-6 py-24 md:py-32"
      aria-label="Our Story — the craft"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">The craft</p>
          <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
            From thread to treasure
          </h2>
          <p className="mt-4 font-body text-ink-muted">
            Four quiet stages — the same journey every piece in our collection follows.
          </p>
        </div>

        <div ref={gridRef} className="space-y-10 md:space-y-14">
          {PROCESS_STEPS.map((step, index) => (
            <article
              key={step.id}
              data-reveal
              className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
            >
              <div className={index % 2 === 1 ? "md:order-2" : undefined}>
                <span className="font-body text-xs uppercase tracking-[0.35em] text-champagne">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-2xl text-maroon md:text-3xl">{step.title}</h3>
                <p className="mt-4 font-body text-sm leading-relaxed text-ink-muted md:text-base">
                  {step.description}
                </p>
              </div>
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-sm border border-champagne/20 shadow-luxury",
                  index % 2 === 1 ? "md:order-1" : undefined,
                )}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/15 to-transparent"
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
