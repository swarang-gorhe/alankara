"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const artisanItems = [
  {
    id: "sketch",
    label: "Design sketches",
    description: "Hand-drawn motifs inspired by heritage patterns",
    icon: (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <path
          d="M12 60 Q30 20 50 35 T72 25"
          fill="none"
          stroke="#b98a4a"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle cx="50" cy="35" r="3" fill="#c9932f" opacity="0.6" />
        <path d="M20 50 L35 45 L50 55" fill="none" stroke="#6f2317" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "needle",
    label: "Artisan needles",
    description: "Fine tools passed through generations of craft",
    icon: (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <line x1="40" y1="10" x2="40" y2="65" stroke="#6f2317" strokeWidth="1.5" />
        <ellipse cx="40" cy="68" rx="2" ry="4" fill="#b98a4a" />
        <path d="M38 15 Q42 25 38 35" fill="none" stroke="#c9932f" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    id: "embroidery",
    label: "Embroidery studies",
    description: "Threadwork samples on natural linen",
    icon: (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <rect x="15" y="20" width="50" height="40" rx="2" fill="#f8ecd9" stroke="#b98a4a" strokeWidth="1" />
        <path
          d="M25 35 Q35 30 45 35 Q55 40 65 35 M25 45 Q40 50 55 45 M30 55 Q40 52 50 55"
          fill="none"
          stroke="#6f2317"
          strokeWidth="1"
          opacity="0.7"
        />
      </svg>
    ),
  },
];

export function ArtisanStoryScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll("[data-artisan-card]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 80, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.2,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 30%",
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
      className="relative px-6 py-24 md:py-32"
      aria-label="Artisan story"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">The atelier</p>
          <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
            Where patience becomes beauty
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-charcoal-muted">
            In our studio, time moves differently. Sketches become stitches. Stitches become
            stories you carry close to skin.
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-8 md:grid-cols-3">
          {artisanItems.map((item, index) => (
            <article
              key={item.id}
              data-artisan-card
              className={cn(
                "paper-card group relative overflow-hidden rounded-sm border border-gold/20 bg-cream-light p-8",
                prefersReducedMotion ? "opacity-100" : "opacity-0",
              )}
              style={{ transform: `translateY(${index * 0}px)` }}
            >
              <div
                className="mb-6 h-20 w-20 text-gold transition-transform duration-500 group-hover:scale-110"
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold/70">
                Illustration placeholder
              </span>
              <h3 className="mt-2 font-display text-xl text-maroon">{item.label}</h3>
              <p className="mt-3 text-sm text-charcoal-muted">{item.description}</p>
              <div
                className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/5"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
