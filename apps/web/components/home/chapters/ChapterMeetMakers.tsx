"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { artisans } from "@/lib/fixtures";
import { STORY_IMAGES } from "@/lib/editorial/story-images";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const studioImages = STORY_IMAGES.filter((img) => ["studio", "stitch", "pearls"].includes(img.id));

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
      className="relative overflow-hidden bg-gradient-to-b from-ivory via-linen/40 to-cotton px-6 py-24 md:py-32"
      aria-label="The Artisans"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">Meet the makers</p>
            <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
              Voices from the studio
            </h2>
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-ink-muted">
              The artisans behind Alankara — each with a signature stitch, a favourite thread, and a
              table by the window.
            </p>
          </div>
          <div className="overflow-hidden rounded-sm border border-champagne/20 shadow-luxury">
            <Image
              src={studioImages[0].src}
              alt="Sunlit studio table with scissors, thread, and embroidered linen"
              width={studioImages[0].width}
              height={studioImages[0].height}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

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
                  "w-[min(85vw,380px)] shrink-0 overflow-hidden rounded-sm border border-sage/30 bg-ivory/90 transition-all duration-base ease-luxury",
                  !prefersReducedMotion && index === activeIndex
                    ? "scale-[1.02] border-champagne/50 shadow-luxury-lg"
                    : "opacity-85",
                )}
              >
                <div className="overflow-hidden">
                  <Image
                    src={studioImages[index % studioImages.length].src}
                    alt=""
                    width={studioImages[index % studioImages.length].width}
                    height={studioImages[index % studioImages.length].height}
                    className="h-auto w-full"
                    sizes="380px"
                    aria-hidden="true"
                  />
                  <div className="h-2 bg-gradient-to-t from-ivory to-transparent" aria-hidden="true" />
                </div>
                <div className="p-8 pt-4">
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
                        className="rounded-full border border-sage/40 bg-cotton px-3 py-1 font-body text-xs text-ink"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
