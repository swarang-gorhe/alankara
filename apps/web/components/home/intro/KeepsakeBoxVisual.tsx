"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type KeepsakeBoxVisualProps = {
  className?: string;
  lidLift?: number;
  glowIntensity?: number;
};

export const KeepsakeBoxVisual = forwardRef<HTMLDivElement, KeepsakeBoxVisualProps>(
  function KeepsakeBoxVisual({ className, lidLift = 0, glowIntensity = 0 }, ref) {
    const lidRotate = lidLift * -68;
    const lidTranslateY = lidLift * -42;
    const innerGlow = Math.min(1, glowIntensity);

    return (
      <div ref={ref} className={cn("relative mx-auto", className)} aria-hidden="true">
        {/* Box base — round embroidered keepsake */}
        <div className="relative h-52 w-52 md:h-64 md:w-64">
          {/* Golden interior glow */}
          <div
            className="absolute inset-x-6 bottom-4 top-16 rounded-b-[50%] bg-gradient-to-t from-champagne/40 via-ivory/80 to-cotton transition-opacity duration-300"
            style={{ opacity: innerGlow }}
          />

          {/* Base cylinder */}
          <div className="absolute inset-x-4 bottom-0 h-28 rounded-b-[50%] bg-gradient-to-b from-maroon/90 to-muted-maroon shadow-luxury-lg md:h-32">
            <div
              className="absolute inset-0 rounded-b-[50%] opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(201,147,47,0.15) 3px, rgba(201,147,47,0.15) 4px)",
              }}
            />
            {/* Pearl stitch dots */}
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-ivory/70"
                style={{
                  left: `${18 + i * 9}%`,
                  bottom: "22%",
                }}
              />
            ))}
          </div>

          {/* Lid */}
          <div
            className="absolute inset-x-2 top-0 origin-bottom will-change-transform"
            style={{
              transform: `perspective(800px) translateY(${lidTranslateY}px) rotateX(${lidRotate}deg)`,
            }}
          >
            <div className="relative h-32 w-full rounded-[50%] bg-gradient-to-br from-maroon via-muted-maroon to-maroon shadow-luxury md:h-36">
              {/* Floral embroidery ring */}
              <svg
                className="absolute inset-2 opacity-70"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="38" stroke="#C9932F" strokeWidth="0.6" opacity="0.5" />
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const cx = 50 + Math.cos(angle) * 28;
                  const cy = 50 + Math.sin(angle) * 28;
                  return (
                    <g key={i} transform={`translate(${cx}, ${cy})`}>
                      <circle r="5" fill="#C9932F" opacity="0.35" />
                      <circle r="2" fill="#FAF3E7" opacity="0.8" />
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="8" fill="#C9932F" opacity="0.25" />
                <circle cx="50" cy="50" r="4" fill="#FAF3E7" opacity="0.6" />
              </svg>
              {/* Velvet texture overlay */}
              <div className="absolute inset-0 rounded-[50%] bg-gradient-to-t from-black/15 to-transparent" />
            </div>
          </div>

          {/* Ribbon knot anchor */}
          <div className="absolute left-1/2 top-[38%] z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="h-3 w-3 rounded-full bg-champagne/80 shadow-[0_0_8px_rgba(201,147,47,0.5)]" />
          </div>
        </div>
      </div>
    );
  },
);
