"use client";

import { useEffect } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { RETURN_BLOOM_DURATION_MS } from "@/lib/intro/constants";
import { cn } from "@/lib/utils";

type IntroBloomProps = {
  onComplete: () => void;
  className?: string;
};

/**
 * Short 2–3s logo bloom for return visits and as reduced-motion fallback accent.
 */
export function IntroBloom({ onComplete, className }: IntroBloomProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, RETURN_BLOOM_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[8000] flex items-center justify-center bg-ivory",
        className,
      )}
      role="status"
      aria-label="Welcome back"
    >
      <FabricTexture id="intro-bloom" opacity={0.06} />
      <AnimatedLogo size={120} playEntrance showTagline />
    </div>
  );
}
