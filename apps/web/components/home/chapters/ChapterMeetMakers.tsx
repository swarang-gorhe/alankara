"use client";

import { useEffect, useRef, useState } from "react";
import { artisans } from "@/lib/fixtures";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function ChapterMeetMakers() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        x: () => -(trackRef.current!.scrollWidth - trackRef.current!.clientWidth),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${artisans.length * 400}`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const index = Math.min(
              artisans.length - 1,
              Math.floor(self.progress * artisans.length),
            );
            setActiveIndex(index);
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-maroon/[0.06] via-cotton to-ivory px-6 py-24 md:py-32"
      aria-label="The Artisans"
    >
      <FabricTexture id="makers" opacity={0.04} />

      <div className="mx-auto max-w-6xl">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">Meet the makers</p>
        <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
          Hands behind the thread
        </h2>

        <div className="mt-12 overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-8 will-change-transform"
            style={prefersReducedMotion ? { flexWrap: "wrap" } : undefined}
          >
            {artisans.map((maker, index) => (
              <article
                key={maker.id}
                className={cn(
                  "paper-card w-[min(85vw,380px)] shrink-0 rounded-sm border border-sage/30 p-8 transition-all duration-base ease-luxury",
                  !prefersReducedMotion && index === activeIndex
                    ? "scale-[1.02] border-champagne/50 shadow-luxury-lg"
                    : "opacity-80",
                )}
              >
                <span className="font-body text-xs uppercase tracking-widest text-champagne">
                  {maker.location}
                </span>
                <h3 className="mt-2 font-display text-2xl text-maroon">{maker.name}</h3>
                <p className="mt-1 font-body text-sm text-olive">{maker.title}</p>
                <p className="mt-4 font-body text-sm text-ink-muted leading-relaxed line-clamp-4">
                  {maker.bio}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {maker.specialty.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-sage/40 bg-ivory px-3 py-1 font-body text-xs text-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-2" aria-hidden="true">
          {artisans.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1 rounded-full transition-all duration-base ease-luxury",
                index === activeIndex ? "w-8 bg-champagne" : "w-4 bg-sage/50",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
