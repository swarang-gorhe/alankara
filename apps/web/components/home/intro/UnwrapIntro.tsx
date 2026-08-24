"use client";

import { useCallback, useEffect, useState } from "react";
import { useIntro } from "@/contexts/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SKIP_INTRO_DELAY_MS } from "@/lib/intro/constants";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro/storage";
import { SkipIntroButton } from "./SkipIntroButton";

type UnwrapIntroProps = {
  children: React.ReactNode;
};

/**
 * Homepage wrapper for the keepsake scroll. First visit: on-page box opening.
 * Return visits and reduced motion: KeepsakeScene renders a still — no second overlay.
 */
export function UnwrapIntro({ children }: UnwrapIntroProps) {
  const { phase, setPhase, completeIntro } = useIntro();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [skipVisible, setSkipVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (prefersReducedMotion || hasSeenIntro()) {
      setFirstVisit(false);
      return;
    }

    setFirstVisit(true);
    setPhase("intro");
    const skipTimer = window.setTimeout(() => setSkipVisible(true), SKIP_INTRO_DELAY_MS);
    return () => clearTimeout(skipTimer);
  }, [mounted, prefersReducedMotion, setPhase]);

  const handleSkip = useCallback(() => {
    markIntroSeen();
    completeIntro();
    document.getElementById("crafted-moments")?.scrollIntoView({ behavior: "auto" });
  }, [completeIntro]);

  const showSkip =
    firstVisit &&
    skipVisible &&
    !prefersReducedMotion &&
    (phase === "intro" || phase === "bloom");

  return (
    <>
      {showSkip && (
        <SkipIntroButton
          onSkip={handleSkip}
          visible={skipVisible}
          className="bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 right-auto -translate-x-1/2"
        />
      )}
      {children}
    </>
  );
}
