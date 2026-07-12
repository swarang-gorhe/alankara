"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Ambient audio architecture stub — wired for future fabric/ghungroo/wind layers.
 * No audio is played; muted by default when implemented.
 */
type IntroAudioContextValue = {
  enabled: boolean;
  muted: boolean;
  playLayer: (layer: IntroAudioLayer) => void;
};

export type IntroAudioLayer =
  | "fabric-rustle"
  | "ghungroo-chime"
  | "gentle-wind"
  | "paper-unfold"
  | "needle-stitch";

const IntroAudioContext = createContext<IntroAudioContextValue>({
  enabled: false,
  muted: true,
  playLayer: () => {},
});

export function IntroAudioProvider({ children }: { children: ReactNode }) {
  return (
    <IntroAudioContext.Provider
      value={{
        enabled: false,
        muted: true,
        playLayer: () => {},
      }}
    >
      {children}
    </IntroAudioContext.Provider>
  );
}

export function useIntroAudio() {
  return useContext(IntroAudioContext);
}
