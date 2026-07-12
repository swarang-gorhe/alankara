"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const collections = [
  {
    id: "sets",
    name: "Curated Sets",
    description: "Matched earrings and collars — small-batch coordinates for gifting",
    accent: "from-maroon/10 to-gold/5",
  },
  {
    id: "everyday",
    name: "Everyday Grace",
    description: "Delicate pieces that elevate the quiet moments",
    accent: "from-olive/10 to-cream-light",
  },
  {
    id: "festive",
    name: "Festive Radiance",
    description: "Statement adornments for celebrations that linger in memory",
    accent: "from-gold/15 to-maroon/5",
  },
];

export function CollectionsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll("[data-collection-card]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 40%",
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
      aria-label="Collections"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Collections</p>
            <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
              Unfold the collection
            </h2>
          </div>
          <Button variant="outline" className="mt-6 md:mt-0" data-magnetic asChild>
            <Link href="/shop" data-cursor-sparkle>
              Explore all
            </Link>
          </Button>
        </div>

        <div ref={gridRef} className="grid gap-8 md:grid-cols-3">
          {collections.map((collection) => {
            const isOpen = hoveredId === collection.id;

            return (
              <article
                key={collection.id}
                data-collection-card
                className={cn(
                  "jewelry-box group relative cursor-pointer overflow-hidden rounded-sm border border-gold/25 bg-cream-light",
                  prefersReducedMotion ? "opacity-100" : "opacity-0",
                )}
                onMouseEnter={() => setHoveredId(collection.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                    collection.accent,
                    isOpen ? "opacity-100" : "opacity-60",
                  )}
                  aria-hidden="true"
                />

                <div className="relative p-8">
                  <div
                    className={cn(
                      "mb-6 flex h-32 items-center justify-center transition-transform duration-700 ease-out",
                      isOpen ? "scale-105" : "scale-100",
                    )}
                  >
                    <div
                      className={cn(
                        "relative h-24 w-32 border border-gold/40 bg-cream transition-all duration-700",
                        isOpen ? "rounded-t-sm rounded-b-lg shadow-lg" : "rounded-sm shadow-md",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute inset-x-0 top-0 h-1/2 origin-top border-b border-gold/30 bg-gradient-to-b from-gold/20 to-cream-light transition-transform duration-700",
                          isOpen ? "-translate-y-full rotate-x-45 opacity-0" : "translate-y-0",
                        )}
                        style={{
                          transform: isOpen ? "perspective(400px) rotateX(-75deg)" : undefined,
                        }}
                        aria-hidden="true"
                      />
                      <div className="flex h-full items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-bright to-gold opacity-80 shadow-inner" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-700",
                      isOpen ? "max-h-40 opacity-100" : "max-h-24 opacity-90",
                    )}
                  >
                    <h3 className="font-display text-xl text-maroon">{collection.name}</h3>
                    <p className="mt-2 text-sm text-charcoal-muted">{collection.description}</p>
                  </div>

                  <div
                    className={cn(
                      "fabric-unfold mt-4 h-1 bg-gradient-to-r from-transparent via-gold to-transparent transition-all duration-700",
                      isOpen ? "w-full opacity-100" : "w-1/2 opacity-50",
                    )}
                    aria-hidden="true"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
