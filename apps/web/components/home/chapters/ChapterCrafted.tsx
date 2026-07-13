"use client";

import { useRef } from "react";
import { EditorialFrame } from "@/components/editorial";
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

/** Our Craft — one idea: slow, tactile making */
export function ChapterCrafted() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "fade-up", stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      className="bg-ivory px-6 py-28 md:py-36"
      aria-label="Our Craft"
    >
      <div ref={contentRef} className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p data-reveal className="font-body text-xs uppercase tracking-[0.3em] text-olive">
              Our craft
            </p>
            <h2 data-reveal className="mt-5 font-display text-4xl text-maroon md:text-5xl lg:text-6xl">
              Made slowly, worn often
            </h2>
            <p data-reveal className="mt-6 max-w-md font-body text-lg leading-relaxed text-ink-muted">
              Alankara pieces begin as thread on linen. We work in fabric, pearl, and ghungroo
              because they move with you.
            </p>
          </div>

          <div data-reveal>
            <EditorialFrame
              src="/editorial/studio-morning.webp"
              alt="Morning light across a linen-covered studio table with scissors and thread"
              className="aspect-[4/5]"
              imageClassName="aspect-[4/5]"
              vignette="none"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3 md:gap-10">
          {craftPillars.map((pillar) => (
            <article key={pillar.title} data-reveal>
              <h3 className="font-display text-xl text-maroon md:text-2xl">{pillar.title}</h3>
              <p className="mt-3 font-body text-base leading-relaxed text-ink-muted">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
