"use client";

import { motion, AnimatePresence } from "framer-motion";
import { INTRO_CHAPTER_BREAKS } from "@/lib/intro/constants";
import { cn } from "@/lib/utils";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

type IntroChapterTextProps = {
  progress: number;
};

export function IntroChapterText({ progress }: IntroChapterTextProps) {
  const showArrival = progress < INTRO_CHAPTER_BREAKS.arrivalEnd;
  const showScrollHint =
    progress > 0.06 && progress < INTRO_CHAPTER_BREAKS.arrivalEnd;
  const showReveal =
    progress >= INTRO_CHAPTER_BREAKS.openingEnd &&
    progress < INTRO_CHAPTER_BREAKS.revealEnd + 0.05;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[18%] z-30 flex flex-col items-center px-6 text-center">
      <AnimatePresence mode="wait">
        {showArrival && (
          <motion.p
            key="arrival"
            className="max-w-md font-display text-xl text-maroon md:text-2xl text-balance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 1.1, ease: LUXURY_EASE }}
          >
            Every little moment begins with a story.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollHint && (
          <motion.p
            key="scroll-hint"
            className="mt-6 font-body text-xs uppercase tracking-[0.35em] text-olive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: LUXURY_EASE }}
          >
            Scroll to unwrap yours
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReveal && (
          <motion.div
            key="wordmark"
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: LUXURY_EASE }}
          >
            <p className="font-display text-3xl tracking-wide text-maroon md:text-4xl">Alankara</p>
            <p className="font-script text-lg text-warm-brown md:text-xl">
              Crafted for little moments.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type TreasureParticlesProps = {
  progress: number;
  mobile?: boolean;
};

export function TreasureParticles({ progress, mobile }: TreasureParticlesProps) {
  const openingProgress = Math.min(
    1,
    Math.max(
      0,
      (progress - INTRO_CHAPTER_BREAKS.untyingEnd) /
        (INTRO_CHAPTER_BREAKS.openingEnd - INTRO_CHAPTER_BREAKS.untyingEnd),
    ),
  );

  if (openingProgress <= 0) return null;

  const count = mobile ? 6 : 12;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const drift = openingProgress * (40 + i * 8);
        const x = 20 + (i * 73) % 60;
        const kind = i % 3;
        return (
          <span
            key={i}
            className={cn(
              "absolute transition-transform duration-100",
              kind === 0 && "h-2 w-2 rounded-full bg-ivory/90 shadow-luxury",
              kind === 1 && "h-1.5 w-1.5 rounded-full border border-champagne/60 bg-cotton",
              kind === 2 && "h-2 w-3 rotate-12 rounded-sm bg-champagne/30",
            )}
            style={{
              left: `${x}%`,
              bottom: `${30 + (i % 4) * 8}%`,
              transform: `translateY(-${drift}px) rotate(${i * 15}deg)`,
              opacity: openingProgress * (0.9 - i * 0.04),
            }}
          />
        );
      })}
    </div>
  );
}

type SilkTransformationProps = {
  progress: number;
};

export function SilkTransformation({ progress }: SilkTransformationProps) {
  const transformProgress = Math.min(
    1,
    Math.max(
      0,
      (progress - INTRO_CHAPTER_BREAKS.revealEnd) /
        (INTRO_CHAPTER_BREAKS.transformEnd - INTRO_CHAPTER_BREAKS.revealEnd),
    ),
  );

  if (transformProgress <= 0) return null;

  const scale = 1 + transformProgress * 4.5;
  const opacity = Math.min(1, transformProgress * 1.2);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
      aria-hidden="true"
    >
      <div
        className="h-48 w-48 rounded-full bg-gradient-to-br from-cotton via-linen to-ivory shadow-[inset_0_0_60px_rgba(201,147,47,0.15)]"
        style={{
          transform: `scale(${scale})`,
          opacity,
        }}
      />
    </div>
  );
}
