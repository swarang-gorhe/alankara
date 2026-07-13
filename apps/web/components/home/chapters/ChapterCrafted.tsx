"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { BotanicalSprig, CraftPillars, GoldDivider, PaperTexture } from "@/components/decor";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Our Craft chapter — matches the Our Craft poster layout */
export function ChapterCrafted() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-20 md:py-28"
      aria-label="Our Craft"
    >
      <PaperTexture variant="linen" />

      <BotanicalSprig position="top-left" size={isMobile ? 80 : 110} className="z-[1]" />

      {/* Patterned fabric corner accent */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-[1] h-32 w-32 opacity-60 md:h-44 md:w-44"
        aria-hidden="true"
        style={{
          background:
            "repeating-linear-gradient(45deg, #C9932F 0px, #C9932F 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, #6F2317 0px, #6F2317 1px, transparent 1px, transparent 8px)",
          clipPath: "polygon(0 100%, 0 0, 100% 100%)",
          opacity: 0.12,
        }}
      />

      <div
        ref={contentRef}
        className={cn(
          "relative z-10 mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16 md:items-center",
          prefersReducedMotion ? "opacity-100" : "opacity-0",
        )}
      >
        <div>
          <h2 className="text-center font-display text-4xl text-maroon md:text-left md:text-5xl">
            Our Craft
          </h2>
          <p className="mt-4 text-center font-body text-base text-ink md:text-left md:text-lg">
            Every piece is:
          </p>

          <div className="mt-8 md:mt-10">
            <CraftPillars />
          </div>

          <GoldDivider width="md" className="mt-10 hidden md:flex" />

          <p className="mt-8 text-center font-body text-sm italic leading-relaxed text-ink-muted md:text-left md:text-base">
            No two pieces are exactly alike — and that&apos;s the beauty of handmade.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-sm border border-champagne/25 bg-ivory shadow-[0_8px_32px_rgba(111,35,23,0.1),0_0_0_1px_rgba(201,147,47,0.08)]">
            <Image
              src="/products/maroon-embroidered-studs.webp"
              alt="Handmade fabric earrings with pearl fringe"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 400px"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ivory/20 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
          {/* Soft pearl shadow beneath product */}
          <div
            className="absolute -bottom-4 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-[50%] bg-maroon/8 blur-xl"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
