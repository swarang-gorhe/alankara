"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const instagramTiles = [
  { id: 1, span: "col-span-2 row-span-2", label: "Festival moment" },
  { id: 2, span: "col-span-1 row-span-1", label: "Atelier detail" },
  { id: 3, span: "col-span-1 row-span-1", label: "Pearl close-up" },
  { id: 4, span: "col-span-1 row-span-2", label: "Festival glow" },
  { id: 5, span: "col-span-1 row-span-1", label: "Thread work" },
  { id: 6, span: "col-span-2 row-span-1", label: "Studio morning" },
];

export function InstagramScene() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative px-6 py-24 md:py-32" aria-label="Instagram gallery">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">@alankara.studio</p>
            <h2 className="mt-4 font-display text-3xl text-maroon md:text-4xl">
              Moments from the atelier
            </h2>
          </div>
          <p className="max-w-xs text-sm text-charcoal-muted">
            A living journal of craft, celebration, and the quiet beauty between.
          </p>
        </div>

        <div className="grid auto-rows-[140px] grid-cols-2 gap-3 md:auto-rows-[180px] md:grid-cols-4 md:gap-4">
          {instagramTiles.map((tile) => (
            <div
              key={tile.id}
              className={cn(
                "group relative overflow-hidden rounded-sm border border-gold/15 bg-gradient-to-br from-cream-light to-olive-linen/40",
                tile.span,
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60">
                  Photo pending
                </span>
              </div>
              <div
                className={cn(
                  "absolute inset-0 flex items-end bg-gradient-to-t from-maroon/40 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  prefersReducedMotion && "opacity-100",
                )}
              >
                <span className="text-xs uppercase tracking-widest text-cream-light">
                  {tile.label}
                </span>
              </div>
              <div
                className={cn(
                  "absolute inset-0 scale-100 transition-transform duration-700 group-hover:scale-105",
                  prefersReducedMotion && "scale-100",
                )}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
