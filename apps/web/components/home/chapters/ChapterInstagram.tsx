"use client";

import { useRef } from "react";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { cn } from "@/lib/utils";

const posts = [
  { id: 1, span: "col-span-2 row-span-2", label: "Embroidery in progress", tone: "bg-cotton" },
  { id: 2, span: "col-span-1 row-span-1", label: "Pearl threading", tone: "bg-linen" },
  { id: 3, span: "col-span-1 row-span-2", label: "Cotton pouch unboxing", tone: "bg-ivory" },
  { id: 4, span: "col-span-1 row-span-1", label: "Studio morning", tone: "bg-sage/20" },
  { id: 5, span: "col-span-2 row-span-1", label: "Ghungroo details", tone: "bg-cotton" },
  { id: 6, span: "col-span-1 row-span-1", label: "Hand-stitching", tone: "bg-linen" },
];

export function ChapterInstagram() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "scale-in", stagger: 0.08 });

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-24 md:py-32"
      aria-label="Instagram"
    >
      <FabricTexture id="instagram" opacity={0.04} />

      <div className="mx-auto max-w-6xl">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">@alankara.studio</p>
        <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
          From the studio floor
        </h2>

        <div
          ref={gridRef}
          className="mt-12 grid auto-rows-[120px] grid-cols-2 gap-3 md:auto-rows-[140px] md:grid-cols-4 md:gap-4"
        >
          {posts.map((post) => (
            <div
              key={post.id}
              data-reveal
              className={cn(
                "group relative overflow-hidden rounded-sm border border-sage/25 transition-transform duration-base ease-luxury hover:scale-[1.02] hover:shadow-luxury",
                post.span,
                post.tone,
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p className="text-center font-display text-sm text-maroon/70 transition-colors group-hover:text-maroon md:text-base">
                  {post.label}
                </p>
              </div>
              <span className="absolute bottom-2 right-2 font-body text-[10px] uppercase tracking-widest text-ink-muted/60">
                photo pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
