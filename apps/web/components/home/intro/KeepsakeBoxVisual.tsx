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
    const lidRotate = lidLift * -72;
    const lidTranslateY = lidLift * -48;
    const innerGlow = Math.min(1, glowIntensity);

    return (
      <div ref={ref} className={cn("relative mx-auto", className)} aria-hidden="true">
        <div className="relative h-56 w-56 md:h-72 md:w-72">
          {/* Ambient shadow pool */}
          <div className="absolute -inset-x-8 bottom-0 h-16 rounded-[50%] bg-maroon/20 blur-2xl" />

          {/* Golden interior glow when opening */}
          <div
            className="absolute inset-x-8 bottom-6 top-20 rounded-b-[48%] bg-gradient-to-t from-champagne/50 via-ivory/90 to-cotton transition-opacity duration-500"
            style={{ opacity: innerGlow }}
          >
            <div
              className="absolute inset-2 rounded-b-[48%] opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 80%, rgba(201,147,47,0.35) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Base cylinder — velvet maroon */}
          <div className="absolute inset-x-3 bottom-0 h-32 rounded-b-[50%] bg-gradient-to-b from-[#8B2E22] via-maroon to-[#4A150E] shadow-[0_20px_50px_rgba(74,21,14,0.45)] md:h-36">
            {/* Gold thread band */}
            <div
              className="absolute inset-x-0 top-[18%] h-3 opacity-70"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #C9932F 0px, #C9932F 2px, transparent 2px, transparent 6px)",
              }}
            />
            {/* Embroidered texture */}
            <div
              className="absolute inset-0 rounded-b-[50%] opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(201,147,47,0.12) 4px, rgba(201,147,47,0.12) 5px)",
              }}
            />
            {/* Pearl stitch ring */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const x = 50 + Math.cos(angle) * 38;
              const y = 72 + Math.sin(angle) * 12;
              return (
                <span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-ivory/85 shadow-[0_0_4px_rgba(250,243,231,0.8)]"
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              );
            })}
          </div>

          {/* Lid — embroidered maroon with gold florals */}
          <div
            className="absolute inset-x-0 top-0 origin-bottom will-change-transform"
            style={{
              transform: `perspective(900px) translateY(${lidTranslateY}px) rotateX(${lidRotate}deg)`,
            }}
          >
            <div className="relative mx-auto h-36 w-[94%] rounded-[50%] bg-gradient-to-br from-[#7A2318] via-maroon to-[#5A1A12] shadow-[0_12px_40px_rgba(43,35,28,0.35)] md:h-44">
              {/* Velvet sheen */}
              <div className="absolute inset-0 rounded-[50%] bg-gradient-to-tr from-black/25 via-transparent to-champagne/10" />

              {/* Gold embroidery ring */}
              <svg
                className="absolute inset-3 opacity-90 md:inset-4"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="40" stroke="#C9932F" strokeWidth="0.8" opacity="0.6" />
                <circle cx="50" cy="50" r="32" stroke="#E8C56A" strokeWidth="0.4" opacity="0.4" strokeDasharray="2 3" />
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                  const cx = 50 + Math.cos(angle) * 30;
                  const cy = 50 + Math.sin(angle) * 30;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="6" fill="#C9932F" opacity="0.4" />
                      <circle cx={cx} cy={cy} r="2.5" fill="#FAF3E7" opacity="0.9" />
                      <path
                        d={`M${cx} ${cy - 8} Q${cx + 4} ${cy - 4} ${cx} ${cy} Q${cx - 4} ${cy - 4} ${cx} ${cy - 8}`}
                        fill="#C9932F"
                        opacity="0.35"
                      />
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="10" fill="#C9932F" opacity="0.3" />
                <circle cx="50" cy="50" r="5" fill="#FAF3E7" opacity="0.75" />
              </svg>

              {/* Pearl clusters at front */}
              <div className="absolute bottom-[22%] left-1/2 flex -translate-x-1/2 gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-gradient-to-br from-ivory to-cotton shadow-[0_0_6px_rgba(250,243,231,0.9)]"
                    style={{ transform: `translateY(${i === 1 ? -2 : 0}px)` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ribbon knot */}
          <div className="absolute left-1/2 top-[40%] z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-champagne to-[#A67A28] shadow-[0_0_12px_rgba(201,147,47,0.6)]" />
              <div className="absolute -left-3 top-1/2 h-1 w-6 -translate-y-1/2 rotate-[-25deg] rounded-full bg-champagne/70" />
              <div className="absolute -right-3 top-1/2 h-1 w-6 -translate-y-1/2 rotate-[25deg] rounded-full bg-champagne/70" />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
