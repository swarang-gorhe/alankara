"use client";

import { useMemo } from "react";
import { INTRO_MOTE_COUNT } from "@/lib/intro/constants";

type IntroMotesProps = {
  className?: string;
};

/** Lightweight drifting thread/dust motes — CSS only, no canvas */
export function IntroMotes({ className }: IntroMotesProps) {
  const motes = useMemo(
    () =>
      Array.from({ length: INTRO_MOTE_COUNT }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: 2 + (i % 3),
        delay: (i % 8) * 0.4,
        duration: 6 + (i % 5) * 1.2,
        opacity: 0.15 + (i % 4) * 0.08,
      })),
    [],
  );

  return (
    <div className={className} aria-hidden="true">
      {motes.map((m) => (
        <span
          key={m.id}
          className="intro-mote absolute rounded-full bg-champagne/60"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
