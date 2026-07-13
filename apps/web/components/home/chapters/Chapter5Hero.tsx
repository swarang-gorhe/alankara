"use client";

import { useEffect, useRef } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import {
  BotanicalSprig,
  GhungrooScatter,
  GoldDivider,
  HeartsDivider,
  PaperTexture,
  PearlScatter,
} from "@/components/decor";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { useIntro } from "@/contexts/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Chapter 5 — Welcome hero matching the welcome poster aesthetic.
 */
export function Chapter5Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const { phase } = useIntro();
  const introComplete = phase === "complete" || phase === "exiting";

  const logoSize = isMobile ? 100 : 120;

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "scale-in" });

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to("[data-hero-pearl]", {
        y: -30,
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
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24"
      aria-label="Welcome to Alankara"
      tabIndex={-1}
    >
      <PaperTexture variant="cream" />

      <PearlScatter density="rich" className="z-[1]" />
      <GhungrooScatter count={5} className="z-[1]" />
      <BotanicalSprig position="top-left" size={isMobile ? 90 : 130} className="z-[1]" />
      <BotanicalSprig position="top-right" size={isMobile ? 90 : 130} className="z-[1]" />
      <BotanicalSprig position="bottom-right" size={isMobile ? 70 : 100} className="z-[1] opacity-70" />

      <div
        data-hero-pearl
        className="pointer-events-none absolute bottom-[18%] left-[8%] z-[1] h-4 w-4 rounded-full bg-gradient-to-br from-white to-cotton shadow-[2px_3px_8px_rgba(43,35,28,0.15)]"
        aria-hidden="true"
      />
      <div
        data-hero-pearl
        className="pointer-events-none absolute bottom-[22%] right-[10%] z-[1] h-3 w-3 rounded-full bg-gradient-to-br from-white to-ivory shadow-[2px_3px_6px_rgba(43,35,28,0.12)]"
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        className={cn(
          "relative z-10 flex max-w-2xl flex-col items-center text-center transition-opacity duration-slow ease-luxury",
          introComplete ? "opacity-100" : "opacity-0",
        )}
      >
        <AnimatedLogo
          variant="full"
          size={logoSize}
          showTagline={false}
          playEntrance={false}
          priority
          className="mb-2 min-w-[240px] md:min-w-[288px]"
        />

        <p data-reveal className="mt-2 font-body text-xs uppercase tracking-[0.2em] text-ink-muted">
          Our promise is simple —
        </p>
        <p data-reveal className="mt-1 font-script text-2xl italic text-warm-brown md:text-3xl">
          Crafted for little moments.
        </p>

        <HeartsDivider className="my-5" />

        <p data-reveal className="max-w-md font-body text-sm leading-relaxed text-ink-muted md:text-base">
          Thank you for being here from the very beginning.
        </p>

        <GoldDivider width="sm" className="my-6" />

        <h1 data-reveal className="font-display text-3xl text-maroon md:text-4xl">
          Welcome to Alankara.
        </h1>

        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-sm uppercase tracking-[0.3em] text-olive"
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
