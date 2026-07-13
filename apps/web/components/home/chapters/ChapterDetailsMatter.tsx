"use client";

import { useRef } from "react";
import { WaxSeal } from "@/components/decor/WaxSeal";
import { DarkLuxuryTexture } from "@/components/decor/DarkLuxuryTexture";
import { DustyRoseDivider } from "@/components/decor/DustyRoseDivider";
import { GoldDivider } from "@/components/decor/GoldDivider";
import { useChapterReveal } from "@/hooks/useChapterReveal";

const details = [
  {
    title: "Materials",
    body: "Breathable cotton bases, silk thread, freshwater pearls, and hand-spun zari — chosen for how they feel against skin.",
  },
  {
    title: "Comfort",
    body: "Lightweight construction, soft backings, and adjustable closures. Pieces meant for hours of wear, not just photographs.",
  },
  {
    title: "Sustainability",
    body: "Small batches, zero-waste embroidery offcuts repurposed into patches, and reusable cotton pouches instead of plastic.",
  },
  {
    title: "Packaging",
    body: "Each order arrives wrapped in tissue, nestled in a hand-stitched cotton pouch you can keep for travel storage.",
    highlight: true,
  },
];

export function ChapterDetailsMatter() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "parallax", stagger: 0.14 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-deep-wine px-6 py-24 md:py-32"
      aria-label="The details matter"
    >
      <DarkLuxuryTexture />

      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-antique-gold/80">
          The details matter
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl text-antique-gold md:text-5xl text-balance">
          Thoughtful in every stitch
        </h2>
        <GoldDivider className="mt-8" width="sm" tone="antique" />
        <DustyRoseDivider className="mt-2" width="sm" />

        <div ref={gridRef} className="mt-16 grid gap-6 sm:grid-cols-2">
          {details.map((item) => (
            <article
              key={item.title}
              data-reveal
              className={
                item.highlight
                  ? "group relative overflow-hidden rounded-sm border border-antique-gold/25 bg-kraft-cream p-8 shadow-luxury transition-shadow duration-base ease-luxury hover:shadow-luxury-lg"
                  : "group rounded-sm border border-antique-gold/15 bg-aged-burgundy/60 p-8 backdrop-blur-sm transition-shadow duration-base ease-luxury hover:border-antique-gold/30"
              }
            >
              {item.highlight && (
                <div className="absolute right-6 top-6">
                  <WaxSeal size={48} />
                </div>
              )}
              <h3
                className={
                  item.highlight
                    ? "font-display text-xl text-deep-wine"
                    : "font-display text-xl text-antique-gold"
                }
              >
                {item.title}
              </h3>
              <p
                className={
                  item.highlight
                    ? "mt-3 max-w-[85%] font-body text-sm text-ink-muted leading-relaxed"
                    : "mt-3 font-body text-sm text-ivory/75 leading-relaxed"
                }
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 rounded-sm border border-dusty-rose/30 bg-aged-burgundy/40 px-8 py-10 text-center backdrop-blur-sm md:flex-row md:justify-between md:text-left">
          <div>
            <p className="font-script text-2xl text-dusty-rose">Sealed with care</p>
            <p className="mt-2 font-body text-sm text-ivory/70">
              Every Alankara piece ships in a kraft-cream pouch with our embossed seal.
            </p>
          </div>
          <WaxSeal size={64} className="shrink-0" />
        </div>
      </div>
    </section>
  );
}
