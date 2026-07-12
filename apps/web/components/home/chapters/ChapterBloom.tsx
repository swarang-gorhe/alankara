"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { ClientErrorBoundary } from "@/components/ui/ClientErrorBoundary";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const WelcomeHero3D = dynamic(() => import("../WelcomeHero3D").then((mod) => mod.WelcomeHero3D), {
  ssr: false,
  loading: () => <BloomFallback />,
});

function BloomFallback() {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-b from-ivory via-linen to-cotton/50"
      aria-hidden="true"
    />
  );
}

export function ChapterBloom() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const isMobile = useIsMobile();
  const show3D = !prefersReducedMotion && !isTouch && !isMobile;

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "scale-in" });

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to("[data-parallax-pearl]", {
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
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24"
      aria-label="The Bloom"
    >
      <FabricTexture id="bloom" opacity={0.05} />
      {!show3D && <BloomFallback />}
      {show3D && (
        <ClientErrorBoundary fallback={<BloomFallback />}>
          <WelcomeHero3D className="absolute inset-0 h-full w-full opacity-90" />
        </ClientErrorBoundary>
      )}

      <div
        data-parallax-pearl
        className="pointer-events-none absolute left-[12%] top-[20%] h-3 w-3 rounded-full bg-ivory/80 shadow-luxury"
        aria-hidden="true"
      />
      <div
        data-parallax-pearl
        className="pointer-events-none absolute right-[18%] top-[35%] h-2 w-2 rounded-full bg-cotton"
        aria-hidden="true"
      />
      <div
        data-parallax-pearl
        className="pointer-events-none absolute bottom-[30%] left-[25%] h-2.5 w-2.5 rounded-full bg-linen"
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div data-reveal className="relative mb-10">
          <div className="absolute inset-0 scale-150 rounded-full bg-champagne/20 blur-3xl" />
          <AnimatedLogo
            size={160}
            showTagline
            className="relative drop-shadow-[0_0_28px_rgba(201,147,47,0.45)]"
          />
        </div>

        <p
          data-reveal
          className="mt-6 max-w-lg font-body text-sm uppercase tracking-[0.35em] text-olive"
        >
          Cloth &amp; thread jewellery
        </p>

        <h1
          data-reveal
          className="mt-4 max-w-4xl font-display text-display text-maroon text-balance"
        >
          Wearable art for little moments
        </h1>
      </div>

      <div
        className={cn(
          "absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-muted",
          prefersReducedMotion && "opacity-70",
        )}
      >
        <span className="font-body text-xs uppercase tracking-[0.3em]">Scroll to discover</span>
        <span className="h-8 w-px bg-gradient-to-b from-champagne to-transparent motion-safe:animate-pulse" />
      </div>
    </section>
  );
}
