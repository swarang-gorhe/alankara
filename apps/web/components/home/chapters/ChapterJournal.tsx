"use client";

import Link from "next/link";
import { useRef } from "react";
import { LuxuryImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { JOURNAL_STORIES } from "@/lib/media";

export function ChapterJournal() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "fade-up", stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      className="bg-ivory px-5 py-24 md:px-8 md:py-36"
      aria-label="Alankara journal"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-olive">
              Chapter 09 — Journal
            </p>
            <h2 className="mt-5 font-display text-4xl text-maroon md:text-6xl">Notes from the atelier</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/journal">Read the journal →</Link>
          </Button>
        </div>

        <div ref={gridRef} className="mt-14 grid gap-8 md:grid-cols-3">
          {JOURNAL_STORIES.map((story) => (
            <Link key={story.slug} href={`/journal/${story.slug}`} data-reveal className="group block">
              <LuxuryImage
                src={story.image.src}
                alt={story.image.alt}
                width={story.image.width}
                height={story.image.height}
                fit="cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                className="aspect-[4/5] w-full border border-champagne/15"
                imageClassName="transition-transform duration-slow ease-luxury group-hover:scale-[1.03]"
              />
              <h3 className="mt-5 font-display text-2xl text-maroon group-hover:text-warm-brown">
                {story.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{story.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
