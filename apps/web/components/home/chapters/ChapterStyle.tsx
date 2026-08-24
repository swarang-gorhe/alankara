"use client";

import { useRef } from "react";
import { LuxuryImage, ProductStill } from "@/components/media";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { products } from "@/lib/fixtures";
import { MEDIA } from "@/lib/media";

export function ChapterStyle() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "fade-up" });

  const drop = products.find((p) => p.slug === "kesari-diamond-drops");

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-linen/40 px-5 py-24 md:px-8 md:py-36"
      aria-label="Style it your way"
    >
      <div ref={contentRef} className="mx-auto max-w-7xl">
        <p data-reveal className="font-body text-xs uppercase tracking-[0.35em] text-olive">
          Chapter 07 — Style it your way
        </p>
        <h2 data-reveal className="mt-5 max-w-3xl font-display text-4xl text-maroon md:text-6xl text-balance">
          Morning chai. Last-minute dinner. Same cloth.
        </h2>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <article data-reveal className="flex flex-col">
            <LuxuryImage
              src={MEDIA.silkCream.src}
              alt={MEDIA.silkCream.alt}
              width={MEDIA.silkCream.width}
              height={MEDIA.silkCream.height}
              fit="cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="aspect-[3/4] w-full border border-champagne/15"
            />
            <h3 className="mt-5 font-display text-2xl text-maroon">Everyday</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
              Smaller studs sit close — forest green and burgundy, light enough to forget until
              someone asks.
            </p>
          </article>
          <article data-reveal className="lg:mt-12">
            {drop && (
              <ProductStill
                name={drop.name}
                slug={drop.slug}
                image={drop.images[0]}
                aspect="square"
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="border border-champagne/15"
                hoverZoom
              />
            )}
            <h3 className="mt-5 font-display text-2xl text-maroon">Statement</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
              Bigger drops in mustard and cocoa — colour that arrives before you do. Shown contained
              on linen until studio photography is ready.
            </p>
          </article>
          <article data-reveal className="lg:mt-6">
            <LuxuryImage
              src={MEDIA.pearls.src}
              alt={MEDIA.pearls.alt}
              width={MEDIA.pearls.width}
              height={MEDIA.pearls.height}
              fit="cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="aspect-square w-full border border-champagne/15"
            />
            <h3 className="mt-5 font-display text-2xl text-maroon">Gifting</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
              Tissue, a cotton pouch, a pair that already feels like a keepsake.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
