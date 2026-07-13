"use client";

import { useRef } from "react";
import { EditorialFrame } from "@/components/editorial";
import { useChapterReveal } from "@/hooks/useChapterReveal";

/** Welcome hero — one headline, one image, generous whitespace */
export function Chapter5Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "fade-up" });

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className="relative min-h-[100svh] overflow-hidden bg-ivory"
      aria-label="Welcome to Alankara"
      tabIndex={-1}
    >
      <div className="mx-auto grid min-h-[100svh] max-w-6xl lg:grid-cols-2 lg:gap-16">
        <div
          ref={contentRef}
          className="flex flex-col justify-center px-6 py-28 lg:px-10 lg:py-36"
        >
          <p data-reveal className="font-body text-xs uppercase tracking-[0.3em] text-olive">
            Cloth &amp; thread jewellery
          </p>
          <h1
            data-reveal
            className="mt-6 max-w-lg font-display text-5xl leading-[1.08] text-maroon md:text-6xl lg:text-[4rem] text-balance"
          >
            Welcome to Alankara.
          </h1>
          <p data-reveal className="mt-6 max-w-md font-script text-2xl italic text-warm-brown md:text-3xl">
            Crafted for little moments.
          </p>
          <p data-reveal className="mt-10 max-w-md font-body text-lg leading-relaxed text-ink-muted">
            Fabric earrings, embroidered collars, and pearl-thread necklaces — finished in small
            batches with quiet patience.
          </p>
        </div>

        <div data-reveal className="relative min-h-[50vh] lg:min-h-[100svh]">
          <EditorialFrame
            src="/editorial/embroidery-hoop.webp"
            alt="Embroidery hoop with layered fabric flowers and pearl centres"
            className="h-full min-h-[50vh] rounded-none border-0 shadow-none lg:min-h-[100svh]"
            imageClassName="min-h-[50vh] lg:min-h-[100svh]"
            priority
            vignette="none"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
