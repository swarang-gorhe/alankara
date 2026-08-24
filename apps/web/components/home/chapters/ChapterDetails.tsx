"use client";

import { useRef } from "react";
import { LuxuryImage } from "@/components/media";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { MEDIA } from "@/lib/media";

const DETAILS = [
  { asset: MEDIA.creamFolds, label: "Cloth texture" },
  { asset: MEDIA.pearls, label: "Pearls" },
  { asset: MEDIA.threadVintage, label: "Components" },
  { asset: MEDIA.threadBrown, label: "Finishing" },
];

export function ChapterDetails() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "clip-up", stagger: 0.08 });

  return (
    <section
      ref={sectionRef}
      className="bg-ivory px-5 py-24 md:px-8 md:py-36"
      aria-label="The details"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-olive">
          Chapter 06 — The details
        </p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl text-maroon md:text-6xl">
          Macro, not costume
        </h2>
        <p className="mt-6 max-w-lg font-body text-lg text-ink-muted">
          Weave, pearl, spool, and cloth — the jewellery is only as honest as its closest view.
        </p>

        <div ref={gridRef} className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {DETAILS.map((item, index) => (
            <figure key={item.asset.id} data-reveal className={index === 0 ? "col-span-2 md:col-span-2" : ""}>
              <LuxuryImage
                src={item.asset.src}
                alt={item.asset.alt}
                width={item.asset.width}
                height={item.asset.height}
                fit="cover"
                sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                className="aspect-[4/5] w-full border border-champagne/15"
              />
              <figcaption className="mt-3 font-body text-[11px] uppercase tracking-[0.22em] text-olive">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
