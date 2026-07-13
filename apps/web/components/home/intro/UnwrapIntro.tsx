"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useIntro } from "@/contexts/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { markIntroSeen, hasSeenIntro } from "@/lib/intro/storage";
import { IntroAudioProvider } from "./IntroAudioProvider";
import { SkipIntroButton } from "./SkipIntroButton";

const OpeningSequence = dynamic(
  () => import("./OpeningSequence").then((mod) => mod.OpeningSequence),
  { ssr: false },
);

const IntroBloom = dynamic(
  () => import("./IntroBloom").then((mod) => mod.IntroBloom),
  { ssr: false },
);

type UnwrapIntroProps = {
  children: React.ReactNode;
};

function scrollToMainContent() {
  const main = document.getElementById("main-content");
  if (main) {
    main.scrollIntoView({ behavior: "auto", block: "start" });
    main.focus({ preventScroll: true });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

export function UnwrapIntro({ children }: UnwrapIntroProps) {
  const { phase, setPhase, completeIntro } = useIntro();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [skipVisible, setSkipVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSequence, setShowSequence] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (prefersReducedMotion) {
      setPhase("complete");
      return;
    }

    if (hasSeenIntro()) {
      setPhase("bloom");
      return;
    }

    setPhase("intro");
    setShowSequence(true);
    const timer = window.setTimeout(() => setSkipVisible(true), 2500);
    return () => window.clearTimeout(timer);
  }, [mounted, prefersReducedMotion, setPhase]);

  const finishIntro = useCallback(
    (skipped = false) => {
      markIntroSeen();
      completeIntro();
      if (skipped) {
        setShowSequence(false);
        scrollToMainContent();
      }
    },
    [completeIntro],
  );

  const handleSkip = useCallback(() => finishIntro(true), [finishIntro]);

  const showBloom = phase === "bloom";

  return (
    <IntroAudioProvider>
      {showSequence && phase === "intro" && (
        <>
          <OpeningSequence onComplete={() => finishIntro(false)} />
          <SkipIntroButton onSkip={handleSkip} visible={skipVisible} />
        </>
      )}

      {showBloom && <IntroBloom onComplete={() => finishIntro(false)} />}

      <div
        className={
          phase === "exiting"
            ? "opacity-100 transition-opacity duration-slow ease-luxury"
            : undefined
        }
      >
        {children}
      </div>
    </IntroAudioProvider>
  );
}
