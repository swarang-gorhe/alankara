"use client";

import { useRef } from "react";
import { StoryMasonry } from "@/components/editorial";

export function ChapterInstagram() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-cotton/40 via-ivory to-linen/50 px-6 py-24 md:py-32"
      aria-label="From the studio"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">@alankara.studio</p>
        <h2 className="mt-4 max-w-xl font-display text-3xl text-maroon md:text-5xl">
          From the studio floor
        </h2>
        <p className="mt-4 max-w-2xl font-body text-sm text-ink-muted md:text-base">
          Thread, pearl, pouch, and morning light — the textures that shape every Alankara piece.
        </p>

        <StoryMasonry className="mt-12" />
      </div>
    </section>
  );
}
