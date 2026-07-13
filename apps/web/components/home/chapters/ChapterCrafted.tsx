"use client";

import { useRef } from "react";
import { EditorialFrame } from "@/components/editorial";
import { GoldDivider } from "@/components/decor";
import { useChapterReveal } from "@/hooks/useChapterReveal";

const craftPillars = [
  {
    title: "Hand-finished",
    body: "Every edge bound, every knot checked — small-batch work you can feel in the weight of the thread.",
  },
  {
    title: "Skin-kind",
    body: "Breathable cotton bases and soft backings, meant for hours of wear rather than a single photograph.",
  },
  {
    title: "One of a kind",
    body: "Motifs shift with each batch; no two pieces carry exactly the same stitch rhythm.",
  },
];

/** Our Craft — editorial narrative with photography, not poster recreation */
export function ChapterCrafted() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "parallax", stagger: 0.12 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-linen/50 via-ivory to-cotton/40 px-6 py-20 md:py-28"
      aria-label="Our Craft"
    >
      <div ref={contentRef} className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 lg:items-end">
          <div className="lg:col-span-5">
            <p data-reveal className="font-body text-xs uppercase tracking-[0.3em] text-olive">
              Our craft
            </p>
            <h2 data-reveal className="mt-4 font-display text-4xl text-maroon md:text-5xl">
              Made slowly, worn often
            </h2>
            <p data-reveal className="mt-5 font-body text-base leading-relaxed text-ink-muted">
              Alankara pieces begin as thread on linen — not as moulds or casts. We work in fabric,
              pearl, and ghungroo because they move with you.
            </p>
            <GoldDivider width="md" className="mt-8" />
          </div>

          <div data-reveal className="lg:col-span-7">
            <EditorialFrame
              src="/editorial/studio-morning.webp"
              alt="Morning light across a linen-covered studio table with scissors and thread"
              caption="Studio morning"
              className="aspect-[16/10]"
              imageClassName="aspect-[16/10]"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {craftPillars.map((pillar) => (
            <article
              key={pillar.title}
              data-reveal
              className="rounded-sm border border-sage/25 bg-ivory/80 p-6 backdrop-blur-sm"
            >
              <h3 className="font-display text-xl text-maroon">{pillar.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">{pillar.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <EditorialFrame
            src="/editorial/ghungroo-detail.webp"
            alt="Maroon fabric beads with gold embroidery and tiny ghungroo bells"
            caption="Ghungroo details"
            className="aspect-[4/3]"
            imageClassName="aspect-[4/3]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <EditorialFrame
            src="/products/maroon-embroidered-studs.webp"
            alt="Maroon embroidered fabric stud earrings with pearl fringe"
            caption="Finished piece"
            className="aspect-[4/3]"
            imageClassName="aspect-[4/3]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
