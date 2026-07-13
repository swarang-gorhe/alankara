"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useIntro } from "@/contexts/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  INTRO_REDUCED_MOTION_MS,
  SKIP_INTRO_DELAY_MS,
} from "@/lib/intro/constants";
import { markIntroSeen, hasSeenIntro } from "@/lib/intro/storage";
import { SkipIntroButton } from "./SkipIntroButton";

const RefinedIntroOverlay = dynamic(
  () => import("./RefinedIntroOverlay").then((mod) => mod.RefinedIntroOverlay),
  { ssr: false },
);

type UnwrapIntroProps = {
  children: React.ReactNode;
};

export function UnwrapIntro({ children }: UnwrapIntroProps) {
  const { phase, setPhase, completeIntro } = useIntro();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [skipVisible, setSkipVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [reducedFade, setReducedFade] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (prefersReducedMotion) {
      setReducedFade(true);
      const timer = window.setTimeout(() => {
        markIntroSeen();
        setPhase("complete");
      }, INTRO_REDUCED_MOTION_MS);
      return () => clearTimeout(timer);
    }

    if (hasSeenIntro()) {
      setIsReturnVisit(true);
      setPhase("bloom");
      setShowOverlay(true);
    } else {
      setPhase("intro");
      setShowOverlay(true);
    }

    const skipTimer = window.setTimeout(() => setSkipVisible(true), SKIP_INTRO_DELAY_MS);
    return () => clearTimeout(skipTimer);
  }, [mounted, prefersReducedMotion, setPhase]);

  const finishIntro = useCallback(
    (skipped = false) => {
      markIntroSeen();
      setShowOverlay(false);
      completeIntro();
      if (skipped) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    [completeIntro],
  );

  const handleSkip = useCallback(() => finishIntro(true), [finishIntro]);

  const showIntroOverlay =
    showOverlay && (phase === "intro" || phase === "bloom") && !prefersReducedMotion;

  return (
    <>
      {showIntroOverlay && (
        <>
          <RefinedIntroOverlay
            compact={isReturnVisit}
            onComplete={() => finishIntro(false)}
          />
          <SkipIntroButton onSkip={handleSkip} visible={skipVisible} />
        </>
      )}

      {reducedFade && (
        <div
          className="pointer-events-none fixed inset-0 z-[8000] bg-ivory transition-opacity duration-[400ms]"
          style={{ opacity: phase === "complete" ? 0 : 1 }}
          aria-hidden="true"
        />
      )}

      <div
        className={
          phase === "exiting" || phase === "complete"
            ? "transition-opacity duration-slow ease-luxury"
            : undefined
        }
      >
        {children}
      </div>
    </>
  );
}
