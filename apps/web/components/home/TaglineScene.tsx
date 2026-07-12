"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function TaglineScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const tearRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 40%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0 0 0)",
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 35%",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        tearRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%",
            end: "bottom 20%",
            scrub: 1,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-6 py-32"
      aria-label="Tagline"
    >
      <div
        ref={tearRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream-light/80 to-transparent"
        aria-hidden="true"
      />

      <div
        ref={lineRef}
        className="mb-10 h-px w-32 origin-center bg-gradient-to-r from-transparent via-gold to-transparent"
        style={{ transform: prefersReducedMotion ? "scaleX(1)" : undefined }}
        aria-hidden="true"
      />

      <p
        ref={textRef}
        className={cn(
          "font-script text-3xl italic text-gold md:text-5xl lg:text-6xl",
          prefersReducedMotion ? "opacity-100" : "opacity-0",
        )}
      >
        Crafted for little moments.
      </p>

      <p className="mt-8 max-w-lg text-center text-charcoal-muted">
        Every stitch carries intention. Every pearl, a whisper of celebration.
      </p>
    </section>
  );
}
