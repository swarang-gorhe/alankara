"use client";

import { useRef } from "react";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useChapterReveal } from "@/hooks/useChapterReveal";

const details = [
  {
    title: "Materials",
    body: "Breathable cotton bases, silk thread, freshwater pearls, and hand-spun zari — chosen for how they feel against skin.",
    glyph: "◌",
  },
  {
    title: "Comfort",
    body: "Lightweight construction, soft backings, and adjustable closures. Pieces meant for hours of wear, not just photographs.",
    glyph: "◇",
  },
  {
    title: "Sustainability",
    body: "Small batches, zero-waste embroidery offcuts repurposed into patches, and reusable cotton pouches instead of plastic.",
    glyph: "◎",
  },
  {
    title: "Packaging",
    body: "Each order arrives wrapped in tissue, nestled in a hand-stitched cotton pouch you can keep for travel storage.",
    glyph: "□",
  },
];

export function ChapterDetailsMatter() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "parallax", stagger: 0.14 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-linen px-6 py-24 md:py-32"
      aria-label="The details matter"
    >
      <FabricTexture id="details" opacity={0.05} />

      <div className="mx-auto max-w-6xl">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">The details matter</p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl text-maroon md:text-5xl text-balance">
          Thoughtful in every stitch
        </h2>

        <div ref={gridRef} className="mt-16 grid gap-6 sm:grid-cols-2">
          {details.map((item) => (
            <article
              key={item.title}
              data-reveal
              className="group rounded-sm border border-sage/25 bg-ivory/80 p-8 transition-shadow duration-base ease-luxury hover:shadow-luxury"
            >
              <span
                className="font-display text-3xl text-champagne/60 transition-colors duration-base group-hover:text-champagne"
                aria-hidden="true"
              >
                {item.glyph}
              </span>
              <h3 className="mt-4 font-display text-xl text-maroon">{item.title}</h3>
              <p className="mt-3 font-body text-sm text-ink-muted leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
