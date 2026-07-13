"use client";

import { useRef } from "react";
import { useChapterReveal } from "@/hooks/useChapterReveal";

/** Brand statement — one editorial beat */
export function ChapterBrandStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: contentRef, variant: "fade-up" });

  return (
    <section
      ref={sectionRef}
      className="bg-cotton/50 px-6 py-28 md:py-36"
      aria-label="Brand statement"
    >
      <div ref={contentRef} className="mx-auto max-w-3xl text-center">
        <p data-reveal className="font-script text-3xl italic text-warm-brown md:text-4xl lg:text-5xl">
          Crafted for little moments.
        </p>
        <p data-reveal className="mt-8 font-body text-lg leading-relaxed text-ink-muted md:text-xl">
          Alankara is cloth and thread jewellery for everyday grace — lightweight enough for morning
          chai, considered enough for the evening you planned at the last minute.
        </p>
      </div>
    </section>
  );
}
