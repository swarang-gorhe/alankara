"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type IntroPhase = "pending" | "intro" | "bloom" | "exiting" | "complete";

type IntroContextValue = {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
  completeIntro: () => void;
  hideChrome: boolean;
  isHomeIntroActive: boolean;
};

const IntroContext = createContext<IntroContextValue | null>(null);

type IntroProviderProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function IntroProvider({ children, enabled = true }: IntroProviderProps) {
  const [phase, setPhase] = useState<IntroPhase>(enabled ? "pending" : "complete");

  const completeIntro = useCallback(() => {
    setPhase("exiting");
    window.setTimeout(() => setPhase("complete"), 600);
  }, []);

  const hideChrome = enabled && (phase === "intro" || phase === "bloom" || phase === "exiting");
  const isHomeIntroActive = enabled && phase !== "complete";

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      completeIntro,
      hideChrome,
      isHomeIntroActive,
    }),
    [phase, completeIntro, hideChrome, isHomeIntroActive],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (!ctx) {
    return {
      phase: "complete" as const,
      setPhase: () => {},
      completeIntro: () => {},
      hideChrome: false,
      isHomeIntroActive: false,
    };
  }
  return ctx;
}
