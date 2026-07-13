"use client";

import { useEffect, useRef } from "react";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function ChapterCrafted() {
  const sectionRef = useRef<HTMLElement>(null);
  const tearRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current || !tearRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tearRef.current,
        { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
        {
          clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 55%)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "top 20%",
            scrub: 1,
          },
        },
      );

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
            start: "top 50%",
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
      className="relative min-h-[80vh] overflow-hidden bg-gradient-to-b from-linen via-linen to-cotton/50 px-6 py-24 md:py-32"
      aria-label="Our Story"
    >
      <FabricTexture id="crafted" opacity={0.04} />

      <div
        ref={tearRef}
        className="absolute inset-0 bg-gradient-to-br from-cotton via-ivory to-linen"
        aria-hidden="true"
      >
        <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
          <path
            d="M0 55 L100 45 L100 100 L0 100 Z"
            fill="none"
            stroke="#C9932F"
            strokeWidth="1"
            strokeDasharray="8 4"
            vectorEffect="non-scaling-stroke"
            transform="scale(10)"
          />
        </svg>
      </div>

      <div
        ref={contentRef}
        className={cn(
          "relative z-10 mx-auto max-w-4xl text-center",
          prefersReducedMotion ? "opacity-100" : "opacity-0",
        )}
      >
        <p className="font-script text-2xl text-warm-brown md:text-3xl">
          Crafted for little moments.
        </p>
        <h2 className="mt-8 font-display text-3xl text-maroon md:text-5xl text-balance">
          Simplicity, grace, comfort — woven into every thread
        </h2>
        <p className="mx-auto mt-8 max-w-2xl font-body text-lg text-ink-muted leading-relaxed">
          Alankara is handmade clothing jewellery — fabric earrings, embroidered collars,
          pearl-thread necklaces, and hair adornments finished in small batches. No two pieces
          are exactly alike. Each one is slow fashion you can wear, not store away.
        </p>
      </div>
    </section>
  );
}
