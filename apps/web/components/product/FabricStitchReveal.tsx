"use client";

import { useEffect, useRef } from "react";
import { ProductPlaceholder } from "@/components/product/ProductPlaceholder";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type FabricStitchRevealProps = {
  name: string;
  image?: string;
  className?: string;
};

export function FabricStitchReveal({ name, image, className }: FabricStitchRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stitchRef = useRef<SVGPathElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !containerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4, defaults: { ease: "power3.inOut" } });

      if (stitchRef.current) {
        const length = stitchRef.current.getTotalLength();
        gsap.set(stitchRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        tl.to(stitchRef.current, { strokeDashoffset: 0, duration: 1.6 });
      }

      tl.to(
        overlayRef.current,
        {
          clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          duration: 1.2,
        },
        "-=0.4",
      );
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-sm border border-sage/30", className)}
    >
      <ProductPlaceholder name={name} image={image} aspectRatio="portrait" />

      {!prefersReducedMotion && !image && (
        <>
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-br from-cotton via-linen to-ivory"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            aria-hidden="true"
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" aria-hidden="true">
              <path
                ref={stitchRef}
                d="M30 250 L200 80 L370 250 L200 420 Z"
                fill="none"
                stroke="#C9932F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-script text-xl text-warm-brown">Unwrapping…</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
