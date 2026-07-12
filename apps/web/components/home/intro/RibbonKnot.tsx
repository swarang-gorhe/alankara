"use client";

import { cn } from "@/lib/utils";

type RibbonKnotProps = {
  progress: number;
  className?: string;
};

/**
 * Pre-authored ribbon knot loosening — scroll-scrubbed via progress (0 = tied, 1 = fallen).
 */
export function RibbonKnot({ progress, className }: RibbonKnotProps) {
  const loosen = Math.min(1, Math.max(0, progress));
  const leftLoopRotate = -35 + loosen * 55;
  const rightLoopRotate = 35 - loosen * 55;
  const leftTranslateX = -8 - loosen * 28;
  const rightTranslateX = 8 + loosen * 28;
  const leftTranslateY = loosen * 48;
  const rightTranslateY = loosen * 52;
  const opacity = 1 - loosen * 0.85;

  return (
    <svg
      className={cn("pointer-events-none absolute left-1/2 top-[38%] z-20 h-24 w-32 -translate-x-1/2 -translate-y-1/2 md:h-28 md:w-36", className)}
      viewBox="0 0 128 96"
      fill="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Left ribbon loop */}
      <g
        style={{
          transform: `translate(${leftTranslateX}px, ${leftTranslateY}px) rotate(${leftLoopRotate}deg)`,
          transformOrigin: "64px 48px",
        }}
      >
        <path
          d="M64 48 C48 28, 28 32, 24 52 C20 72, 40 80, 64 68"
          stroke="#C9932F"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M64 48 L52 88"
          stroke="#B98A4A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Right ribbon loop */}
      <g
        style={{
          transform: `translate(${rightTranslateX}px, ${rightTranslateY}px) rotate(${rightLoopRotate}deg)`,
          transformOrigin: "64px 48px",
        }}
      >
        <path
          d="M64 48 C80 28, 100 32, 104 52 C108 72, 88 80, 64 68"
          stroke="#C9932F"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M64 48 L76 90"
          stroke="#B98A4A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Center knot */}
      <circle
        cx="64"
        cy="48"
        r={6 - loosen * 2}
        fill="#C9932F"
        opacity={1 - loosen * 0.5}
      />
    </svg>
  );
}
