"use client";

import { useRef } from "react";
import { FloatingThreads } from "@/components/decor/FloatingThreads";
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import { ThreadLine } from "@/components/decor/ThreadLine";
import { LuxuryImage, ProductStill } from "@/components/media";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { MEDIA } from "@/lib/media";
import { products } from "@/lib/fixtures";

export function ChapterMoments() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "fade-up" });

  const featured = products.filter((p) => p.featured)[0];

  return (
    <section
      ref={sectionRef}
      id="crafted-moments"
      className="relative overflow-hidden bg-ivory px-5 py-24 md:px-8 md:py-36 lg:py-44"
      aria-label="Crafted for little moments"
    >
      <GrainOverlay className="opacity-40" />
      <FloatingThreads count={5} />
      <div ref={contentRef} className="relative mx-auto max-w-7xl">
        <p data-reveal className="font-body text-xs uppercase tracking-[0.35em] text-olive">
          Chapter 02
        </p>
        <h2
          data-reveal
          className="mt-6 max-w-5xl font-display text-display-xl text-maroon text-balance"
        >
          Crafted for
          <span className="block font-script italic font-normal text-warm-brown">little moments.</span>
        </h2>
        <ThreadLine className="mt-10 max-w-md" />
        <p
          data-reveal
          className="mt-10 max-w-xl font-body text-lg leading-relaxed text-ink-muted md:text-xl"
        >
          Alankara is handmade cloth jewellery — fabric earrings, textile drops, and lightweight
          pieces assembled by hand. Beautiful jewellery made from fabric, meant for the hours you
          actually live.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-5 md:mt-24 md:grid-cols-12 md:gap-6">
          <div data-reveal className="md:col-span-7">
            <LuxuryImage
              src={MEDIA.silkCream.src}
              alt={MEDIA.silkCream.alt}
              width={MEDIA.silkCream.width}
              height={MEDIA.silkCream.height}
              fit="cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              className="aspect-[4/5] w-full border border-champagne/15 md:aspect-[16/11]"
            />
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-ink-muted">
              Cloth, thread, pearls, beads, and ghungroos — materials that move with you rather than
              sit in a box.
            </p>
          </div>
          {featured && (
            <div data-reveal className="md:col-span-5 md:mt-16">
              <ProductStill
                name={featured.name}
                slug={featured.slug}
                image={featured.images[0]}
                aspect="square"
                sizes="(max-width: 768px) 100vw, 32vw"
                className="border border-champagne/15"
                hoverZoom
              />
              <p className="mt-4 font-script text-lg italic text-warm-brown">{featured.name}</p>
              <p className="mt-1 font-body text-xs uppercase tracking-[0.2em] text-olive">
                Contained on linen · never cropped
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
