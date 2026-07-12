"use client";

import { useRef } from "react";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useChapterReveal } from "@/hooks/useChapterReveal";

const processSteps = [
  {
    id: "thread",
    title: "Thread selection",
    description: "Cotton, silk, and zari threads are chosen for weight, drape, and how they catch afternoon light.",
    icon: "🧵",
  },
  {
    id: "embroidery",
    title: "Hand embroidery",
    description: "Motifs are sketched on butter paper, then stitched frame by frame — running stitch, satin, and French knots.",
    icon: "✿",
  },
  {
    id: "pearls",
    title: "Pearl & ghungroo",
    description: "Freshwater pearls and tiny ghungroos are knotted by hand so each strand moves with you.",
    icon: "○",
  },
  {
    id: "finish",
    title: "Finishing touch",
    description: "Every clasp is tested, every edge bound in cotton tape. Pieces ship in a reusable fabric pouch.",
    icon: "◈",
  },
];

export function ChapterThreadToTreasure() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "mask-left", stagger: 0.15 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-ivory px-6 py-24 md:py-32"
      aria-label="Our Story — the craft"
    >
      <FabricTexture id="thread" opacity={0.05} />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">The craft</p>
          <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
            From thread to treasure
          </h2>
          <p className="mt-4 font-body text-ink-muted">
            Illustrations of our process — no product photography yet, only the hands and
            materials behind each piece.
          </p>
        </div>

        <div ref={gridRef} className="grid gap-8 md:grid-cols-2">
          {processSteps.map((step, index) => (
            <article
              key={step.id}
              data-reveal
              className="paper-card relative overflow-hidden rounded-sm border border-sage/30 p-8"
            >
              <div
                className="absolute -right-4 -top-4 font-display text-8xl text-champagne/15"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-champagne/40 bg-cotton font-display text-2xl text-maroon"
                aria-hidden="true"
              >
                {step.icon}
              </div>
              <h3 className="font-display text-xl text-maroon">{step.title}</h3>
              <p className="mt-3 font-body text-sm text-ink-muted leading-relaxed">
                {step.description}
              </p>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-champagne/50 via-sage/30 to-transparent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
