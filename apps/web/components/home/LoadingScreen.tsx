"use client";

import { useEffect, useState } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  onComplete: () => void;
};

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"stitch" | "reveal" | "done">("stitch");

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 400);
      return () => clearTimeout(timer);
    }

    const stitchTimer = setTimeout(() => setPhase("reveal"), 1600);
    const revealTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(stitchTimer);
      clearTimeout(revealTimer);
    };
  }, [onComplete, prefersReducedMotion]);

  if (phase === "done") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center bg-ivory transition-opacity duration-slow ease-luxury",
        phase === "reveal" && "opacity-0",
      )}
      aria-hidden={phase === "reveal"}
      role="status"
      aria-label="Loading"
    >
      <FabricTexture id="loading" opacity={0.06} />

      <div className="relative flex flex-col items-center">
        <AnimatedLogo size={120} playEntrance showTagline />

        {!prefersReducedMotion && (
          <svg
            className="mt-8 h-16 w-16 text-champagne"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="origin-center motion-safe:animate-[spin_3s_linear_infinite] opacity-40"
            />
            <path
              d="M32 8 L32 32 L48 40"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="loading-stitch-path"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
