"use client";

import { useEffect, useRef } from "react";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { useIntro } from "@/contexts/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Chapter 5 — The First Hero
 * Headline "Crafted for little moments." Nav appears after intro completes.
 */
export function Chapter5Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { phase } = useIntro();
  const introComplete = phase === "complete" || phase === "exiting";

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "scale-in" });

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to("[data-hero-pearl]", {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-linen via-ivory to-cotton/50 px-6 py-24"
      aria-label="Crafted for little moments"
      tabIndex={-1}
    >
      <FabricTexture id="hero" opacity={0.05} />

      <div
        data-hero-pearl
        className="pointer-events-none absolute left-[12%] top-[20%] h-3 w-3 rounded-full bg-ivory/80 shadow-luxury"
        aria-hidden="true"
      />
      <div
        data-hero-pearl
        className="pointer-events-none absolute right-[18%] top-[35%] h-2 w-2 rounded-full bg-cotton"
        aria-hidden="true"
      />
      <div
        data-hero-pearl
        className="pointer-events-none absolute bottom-[30%] left-[25%] h-2.5 w-2.5 rounded-full bg-linen"
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        className={cn(
          "relative z-10 flex flex-col items-center text-center transition-opacity duration-slow ease-luxury",
          introComplete ? "opacity-100" : "opacity-0",
        )}
      >
        <p data-reveal className="font-script text-2xl text-warm-brown md:text-3xl">
          Crafted for little moments.
        </p>

        <h1
          data-reveal
          className="mt-6 max-w-4xl font-display text-display text-maroon text-balance"
        >
          Wearable art for little moments
        </h1>

        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-sm uppercase tracking-[0.35em] text-olive"
        >
          Cloth &amp; thread jewellery
        </p>
      </div>

      <div
        className={cn(
          "absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-muted transition-opacity duration-slow",
          introComplete ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="font-body text-xs uppercase tracking-[0.3em]">Scroll to discover</span>
        <span className="h-8 w-px bg-gradient-to-b from-champagne to-transparent motion-safe:animate-pulse" />
      </div>
    </section>
  );
}
