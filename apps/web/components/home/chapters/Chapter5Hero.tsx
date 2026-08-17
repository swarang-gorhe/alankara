"use client";

import { useRef } from "react";
import { EditorialFrame } from "@/components/editorial";
import { useChapterReveal } from "@/hooks/useChapterReveal";

/** Welcome hero — one headline, one panoramic image, generous whitespace */
export function Chapter5Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "fade-up" });

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className="relative overflow-hidden bg-ivory"
      aria-label="Welcome to Alankara"
      tabIndex={-1}
    >
      <div ref={contentRef} className="mx-auto max-w-6xl px-6 py-20 md:py-28 lg:py-32">
        <div className="max-w-xl">
          <p data-reveal className="font-body text-xs uppercase tracking-[0.3em] text-olive">
            Cloth &amp; thread jewellery
          </p>
          <h1
            data-reveal
            className="mt-6 max-w-lg font-display text-5xl leading-[1.08] text-maroon md:text-6xl lg:text-[4rem] text-balance"
          >
            Welcome to Alankara.
          </h1>
          <p
            data-reveal
            className="mt-6 max-w-md font-script text-2xl italic text-warm-brown md:text-3xl"
          >
            Crafted for little moments.
          </p>
          <p data-reveal className="mt-10 max-w-md font-body text-lg leading-relaxed text-ink-muted">
            Fabric earrings in two sizes — bigger drops and smaller studs — finished in small
            batches with quiet patience.
          </p>
        </div>

        <div data-reveal className="mt-14 md:mt-16">
          <EditorialFrame
            src="/products/kesari-diamond-drops.webp"
            alt="Mustard geometric fabric drop earrings finished with gold bead dangles"
            width={1400}
            height={900}
            className="w-full"
            priority
            vignette="none"
            sizes="(max-width: 1024px) 100vw, 80vw"
          />
        </div>
      </div>
    </section>
  );
}
