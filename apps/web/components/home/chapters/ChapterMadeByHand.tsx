"use client";

import { useRef } from "react";
import { LuxuryImage } from "@/components/media";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { MEDIA } from "@/lib/media";
import { PROCESS_STEPS } from "@/lib/editorial/story-images";

export function ChapterMadeByHand() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "fade-up", stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-ivory px-5 py-24 md:px-8 md:py-36"
      aria-label="Made by hand"
    >
      <div ref={contentRef} className="mx-auto max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p data-reveal className="font-body text-xs uppercase tracking-[0.35em] text-olive">
              Chapter 04 — Made by hand
            </p>
            <h2 data-reveal className="mt-6 font-display text-4xl text-maroon md:text-6xl text-balance">
              Cutting, folding, finishing
            </h2>
            <p data-reveal className="mt-6 max-w-md font-body text-lg leading-relaxed text-ink-muted">
              No two pairs share an identical rhythm. Hands cut the cloth, fold the form, set the
              components, and close the pouch.
            </p>
          </div>
          <div data-reveal className="lg:col-span-7">
            <LuxuryImage
              src={MEDIA.cutting.src}
              alt={MEDIA.cutting.alt}
              width={MEDIA.cutting.width}
              height={MEDIA.cutting.height}
              fit="cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="aspect-[4/5] w-full border border-champagne/15 md:aspect-[16/11]"
            />
          </div>
        </div>

        <ol className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.id} data-reveal>
              <span className="font-body text-[11px] uppercase tracking-[0.28em] text-champagne">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl text-maroon">{step.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
