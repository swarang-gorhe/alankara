"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { FabricTexture } from "@/components/ui/FabricTexture";
import {
  INTRO_FULL_DURATION_MS,
  INTRO_GRADIENT_MS,
  INTRO_NAME_START_MS,
  INTRO_REVEAL_START_MS,
  INTRO_RETURN_DURATION_MS,
  INTRO_TAGLINE_START_MS,
} from "@/lib/intro/constants";
import { cn } from "@/lib/utils";
import { IntroMotes } from "./IntroMotes";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

type RefinedIntroOverlayProps = {
  onComplete: () => void;
  /** Compressed return-visit sequence */
  compact?: boolean;
  className?: string;
};

export function RefinedIntroOverlay({
  onComplete,
  compact = false,
  className,
}: RefinedIntroOverlayProps) {
  const [phase, setPhase] = useState<"gradient" | "bloom" | "name" | "reveal" | "done">(
    compact ? "bloom" : "gradient",
  );

  const totalMs = compact ? INTRO_RETURN_DURATION_MS : INTRO_FULL_DURATION_MS;

  useEffect(() => {
    if (compact) {
      const t1 = window.setTimeout(() => setPhase("name"), 400);
      const t2 = window.setTimeout(() => setPhase("reveal"), 800);
      const t3 = window.setTimeout(() => {
        setPhase("done");
        onComplete();
      }, INTRO_RETURN_DURATION_MS);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    const timers = [
      window.setTimeout(() => setPhase("bloom"), INTRO_GRADIENT_MS),
      window.setTimeout(() => setPhase("name"), INTRO_NAME_START_MS),
      window.setTimeout(() => setPhase("reveal"), INTRO_REVEAL_START_MS),
      window.setTimeout(() => {
        setPhase("done");
        onComplete();
      }, INTRO_FULL_DURATION_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [compact, onComplete]);

  if (phase === "done") return null;

  const isRevealing = phase === "reveal";

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-[8000] flex items-center justify-center overflow-hidden",
        className,
      )}
      initial={{ opacity: 1, y: 0 }}
      animate={
        isRevealing
          ? { opacity: 0, y: -12, transition: { duration: 0.8, ease: LUXURY_EASE } }
          : { opacity: 1, y: 0 }
      }
      role="status"
      aria-label="Welcome to Alankara"
      aria-live="polite"
    >
      {/* Warm gradient awakening */}
      <motion.div
        className="absolute inset-0"
        initial={
          compact
            ? { background: "linear-gradient(160deg, #FAF3E7 0%, #F3E4CD 100%)" }
            : { background: "linear-gradient(160deg, #3D1520 0%, #3D1520 100%)" }
        }
        animate={{
          background: [
            compact
              ? "linear-gradient(160deg, #FAF3E7 0%, #F3E4CD 100%)"
              : "linear-gradient(160deg, #3D1520 0%, #6F2317 40%, #F3E4CD 75%, #FAF3E7 100%)",
            "linear-gradient(160deg, #FAF3E7 0%, #F3E4CD 60%, #EDE1CE 100%)",
          ],
        }}
        transition={{ duration: compact ? 0.3 : INTRO_GRADIENT_MS / 1000, ease: LUXURY_EASE }}
        aria-hidden="true"
      />

      <FabricTexture id="intro-refined" opacity={0.04} />

      {!compact && <IntroMotes className="pointer-events-none absolute inset-0" />}

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: phase === "gradient" && !compact ? 0 : 1,
            scale: 1,
          }}
          transition={{ duration: 0.6, ease: LUXURY_EASE }}
        >
          <AnimatedLogo
            variant="full"
            size={compact ? 96 : 112}
            playEntrance={!compact && phase !== "gradient"}
            showTagline={false}
            priority
            className="min-w-[220px] md:min-w-[260px]"
          />
        </motion.div>

        <motion.p
          className="mt-6 font-display text-2xl tracking-[0.2em] text-maroon md:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: phase === "name" || phase === "reveal" ? 1 : 0,
            y: phase === "name" || phase === "reveal" ? 0 : 16,
          }}
          transition={{ duration: 0.5, ease: LUXURY_EASE }}
        >
          ALANKARA
        </motion.p>

        <motion.p
          className="mt-3 font-script text-xl italic text-warm-brown md:text-2xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: phase === "name" || phase === "reveal" ? 1 : 0,
            y: phase === "name" || phase === "reveal" ? 0 : 12,
          }}
          transition={{ duration: 0.5, ease: LUXURY_EASE, delay: compact ? 0.1 : 0.4 }}
        >
          Crafted for little moments.
        </motion.p>
      </div>

      <span className="sr-only">Loading welcome sequence, {totalMs}ms</span>
    </motion.div>
  );
}
