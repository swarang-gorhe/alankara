"use client";

import Image from "next/image";
import { useRef } from "react";
import { PROCESS_STEPS } from "@/lib/editorial/story-images";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { cn } from "@/lib/utils";

/** Process chapter — four stages, one image each */
export function ChapterThreadToTreasure() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "fade-up", stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      className="bg-linen/40 px-6 py-28 md:py-36"
      aria-label="Our Story — the craft"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 max-w-xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">The craft</p>
          <h2 className="mt-5 font-display text-4xl text-maroon md:text-5xl lg:text-6xl">
            From thread to treasure
          </h2>
        </div>

        <div ref={gridRef} className="space-y-20 md:space-y-28">
          {PROCESS_STEPS.map((step, index) => (
            <article
              key={step.id}
              data-reveal
              className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
            >
              <div className={index % 2 === 1 ? "md:order-2" : undefined}>
                <span className="font-body text-xs uppercase tracking-[0.35em] text-champagne">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl text-maroon md:text-3xl">{step.title}</h3>
                <p className="mt-4 max-w-md font-body text-base leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </div>
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-sm",
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
