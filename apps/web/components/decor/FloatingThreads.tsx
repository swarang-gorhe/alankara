"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type FloatingThreadsProps = {
  className?: string;
  count?: number;
};

/** Subtle drifting thread lines — decorative, not required for navigation. */
export function FloatingThreads({ className, count = 7 }: FloatingThreadsProps) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="thread-drift absolute h-px bg-gradient-to-r from-transparent via-champagne/40 to-transparent"
          style={{
            top: `${12 + i * 12}%`,
            left: `${-20 + (i % 3) * 10}%`,
            width: `${40 + (i % 4) * 12}%`,
            animationDelay: `${i * 1.1}s`,
            animationDuration: `${14 + i * 1.4}s`,
            opacity: 0.35,
          }}
        />
      ))}
    </div>
  );
}
