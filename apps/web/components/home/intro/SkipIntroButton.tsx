"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SKIP_INTRO_DELAY_MS } from "@/lib/intro/constants";

type SkipIntroButtonProps = {
  onSkip: () => void;
  visible: boolean;
  className?: string;
};

export function SkipIntroButton({ onSkip, visible, className }: SkipIntroButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onSkip}
      className={cn(
        "fixed bottom-6 right-6 z-[9000] rounded-full border border-champagne/40 bg-ivory/90 px-5 py-2.5 font-body text-xs uppercase tracking-[0.25em] text-ink-muted shadow-luxury backdrop-blur-sm transition-colors hover:border-champagne hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne",
        className,
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: SKIP_INTRO_DELAY_MS / 1000 }}
      aria-label="Skip intro and go to homepage"
    >
      Skip Intro
    </motion.button>
  );
}
