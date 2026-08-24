"use client";

import { LuxuryImage } from "@/components/media";
import { FlowerDivider } from "@/components/brand/FlowerMotif";
import { ATELIER_MEDIA, MEDIA } from "@/lib/media";
import { BRAND_INSTAGRAM_HANDLE, BRAND_INSTAGRAM_URL } from "@/lib/brand/contact";

const TILES = [
  ATELIER_MEDIA.heroEarrings,
  ATELIER_MEDIA.selectFabric,
  ATELIER_MEDIA.shapeFabric,
  ATELIER_MEDIA.addDetails,
  ATELIER_MEDIA.assemble,
  ATELIER_MEDIA.floralEarrings,
  MEDIA.creamFolds,
  MEDIA.pearls,
] as const;

export function HomeSocial() {
  return (
    <section className="bg-ivory px-5 py-16 sm:px-8 md:py-24" aria-label="From the atelier">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <a
            href={BRAND_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] uppercase tracking-[0.28em] text-olive hover:text-maroon"
          >
            {BRAND_INSTAGRAM_HANDLE}
          </a>
          <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">From the atelier</h2>
          <FlowerDivider className="mt-6" />
          <a
            href={BRAND_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-body text-sm text-maroon underline-offset-4 hover:underline"
          >
            Follow on Instagram →
          </a>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {TILES.map((tile) => (
            <a
              key={tile.id}
              href={BRAND_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden rounded-xl border border-champagne/15"
            >
              <LuxuryImage
                src={tile.src}
                alt={tile.alt}
                width={tile.width}
                height={tile.height}
                fit="cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                className="aspect-square w-full"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
