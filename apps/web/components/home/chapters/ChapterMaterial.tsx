"use client";

import { useRef } from "react";
import { ThreadLine } from "@/components/decor/ThreadLine";
import { LuxuryImage } from "@/components/media";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { MATERIAL_CHAPTER } from "@/lib/media";
import { cn } from "@/lib/utils";

export function ChapterMaterial() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "mask-left", stagger: 0.12 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-linen/50 px-5 py-24 md:px-8 md:py-36"
      aria-label="The material"
    >
      <div ref={contentRef} className="mx-auto max-w-7xl">
        <p data-reveal className="font-body text-xs uppercase tracking-[0.35em] text-olive">
          Chapter 03 — The material
        </p>
        <h2 data-reveal className="mt-6 max-w-3xl font-display text-4xl text-maroon md:text-6xl text-balance">
          What the jewellery is made of
        </h2>
        <ThreadLine className="mt-8 max-w-xs" />

        <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
          {MATERIAL_CHAPTER.map((item, index) => (
            <article
              key={item.asset.id}
              data-reveal
              className="grid items-center gap-8 md:grid-cols-12 md:gap-12"
            >
              <div className={cn("md:col-span-7", index % 2 === 1 && "md:order-2")}>
                <LuxuryImage
                  src={item.asset.src}
                  alt={item.asset.alt}
                  width={item.asset.width}
                  height={item.asset.height}
                  fit="cover"
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="aspect-[4/3] w-full border border-champagne/15 md:aspect-[16/10]"
                />
              </div>
              <div className={cn("md:col-span-5", index % 2 === 1 && "md:order-1")}>
                <p className="font-body text-[11px] uppercase tracking-[0.3em] text-champagne">
                  {item.kicker}
                </p>
                <h3 className="mt-3 font-display text-3xl text-maroon md:text-4xl">{item.title}</h3>
                <p className="mt-5 max-w-md font-body text-base leading-relaxed text-ink-muted md:text-lg">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
