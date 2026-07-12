"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const timelineSteps = [
  {
    id: "source",
    year: "Day 1",
    title: "Sourcing",
    description: "Natural threads, freshwater pearls, and ethically mined metals arrive at our atelier",
  },
  {
    id: "design",
    year: "Day 3",
    title: "Design",
    description: "Artisans sketch motifs drawn from heritage patterns and personal stories",
  },
  {
    id: "craft",
    year: "Day 7",
    title: "Handcraft",
    description: "Each piece is stitched, set, and finished by a single pair of skilled hands",
  },
  {
    id: "inspect",
    year: "Day 10",
    title: "Inspection",
    description: "Every clasp, every knot — examined under golden afternoon light",
  },
  {
    id: "deliver",
    year: "Day 12",
    title: "To you",
    description: "Wrapped in tissue, nestled in a keepsake box — ready for its first moment",
  },
];

export function TimelineScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current || !pinRef.current) return;

    const steps = stepsRef.current?.querySelectorAll("[data-timeline-step]");

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=250%",
        pin: pinRef.current,
        scrub: 1,
      });

      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=250%",
              scrub: 1,
            },
          },
        );
      }

      if (steps) {
        steps.forEach((step, index) => {
          gsap.fromTo(
            step,
            { opacity: 0.3, x: -20 },
            {
              opacity: 1,
              x: 0,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `top+=${index * 15}% top`,
                end: `top+=${(index + 1) * 15}% top`,
                scrub: 1,
              },
            },
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      aria-label="Behind every thread"
    >
      <div ref={pinRef} className="flex min-h-screen items-center px-6 py-24">
        <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Behind every thread</p>
            <h2 className="mt-4 font-display text-3xl text-maroon md:text-4xl">
              Twelve days of devotion
            </h2>
            <p className="mt-6 text-charcoal-muted">
              From raw materials to the moment it rests against your skin — every Alankara piece
              follows a journey of deliberate care.
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute bottom-0 left-4 top-0 w-px bg-gold/20"
              aria-hidden="true"
            />
            <div
              ref={progressRef}
              className="absolute bottom-0 left-4 top-0 w-px origin-top bg-gradient-to-b from-gold-bright to-gold"
              style={{ transform: prefersReducedMotion ? "scaleY(1)" : "scaleY(0)" }}
              aria-hidden="true"
            />

            <div ref={stepsRef} className="space-y-10 pl-12">
              {timelineSteps.map((step, index) => (
                <div
                  key={step.id}
                  data-timeline-step
                  className={cn(
                    "relative",
                    prefersReducedMotion ? "opacity-100" : index === 0 ? "opacity-100" : "opacity-30",
                  )}
                >
                  <div
                    className="absolute -left-[2.55rem] top-1 h-3 w-3 rounded-full border-2 border-gold bg-cream"
                    aria-hidden="true"
                  />
                  <span className="text-xs uppercase tracking-widest text-gold">{step.year}</span>
                  <h3 className="mt-1 font-display text-xl text-maroon">{step.title}</h3>
                  <p className="mt-2 text-sm text-charcoal-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
