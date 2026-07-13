"use client";

import { useRef } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { EditorialFrame } from "@/components/editorial";
import { GoldDivider } from "@/components/decor";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { useIntro } from "@/contexts/IntroContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

/** Welcome hero — editorial split layout with studio photography */
export function Chapter5Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { phase } = useIntro();
  const introComplete = phase === "complete" || phase === "exiting";

  const logoSize = isMobile ? 88 : 104;

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "mask-left" });

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className="relative min-h-[100svh] overflow-hidden bg-ivory"
      aria-label="Welcome to Alankara"
      tabIndex={-1}
    >
      <div className="mx-auto grid min-h-[100svh] max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Copy column */}
        <div
          ref={contentRef}
          className={cn(
            "relative z-10 flex flex-col justify-center px-6 py-20 transition-opacity duration-slow ease-luxury lg:px-10 lg:py-24 xl:px-14",
            introComplete ? "opacity-100" : "opacity-0",
          )}
        >
          <AnimatedLogo
            variant="full"
            size={logoSize}
            showTagline={false}
            playEntrance={false}
            priority
            className="mb-6 min-w-[220px] md:min-w-[260px]"
          />

          <p data-reveal className="font-body text-xs uppercase tracking-[0.28em] text-olive">
            Cloth &amp; thread jewellery
          </p>
          <h1
            data-reveal
            className="mt-4 max-w-md font-display text-4xl leading-[1.1] text-maroon md:text-5xl lg:text-[3.25rem] text-balance"
          >
            Welcome to Alankara.
          </h1>
          <p data-reveal className="mt-5 max-w-md font-script text-2xl italic text-warm-brown">
            Crafted for little moments.
          </p>

          <GoldDivider width="sm" className="my-8" />

          <p data-reveal className="max-w-md font-body text-base leading-relaxed text-ink-muted">
            Fabric earrings, embroidered collars, pearl-thread necklaces, and hair adornments —
            finished in small batches with the patience of a studio morning.
          </p>

          <p
            data-reveal
            className="mt-8 font-body text-xs uppercase tracking-[0.3em] text-ink-muted/80"
          >
            Scroll to discover
          </p>
        </div>

        {/* Editorial image column */}
        <div
          data-reveal
          className={cn(
            "relative min-h-[42vh] lg:min-h-[100svh]",
            introComplete ? "opacity-100" : "opacity-0",
          )}
        >
          <EditorialFrame
            src="/editorial/embroidery-hoop.webp"
            alt="Embroidery hoop with layered fabric flowers and pearl centres"
            caption="Embroidery in progress"
            className="h-full min-h-[42vh] rounded-none border-0 shadow-none lg:min-h-[100svh]"
            imageClassName="min-h-[42vh] lg:min-h-[100svh]"
            priority
            vignette="bottom"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-ivory to-transparent lg:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
