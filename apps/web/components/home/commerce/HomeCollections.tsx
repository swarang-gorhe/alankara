"use client";

import Link from "next/link";
import { FlowerMotif } from "@/components/brand/FlowerMotif";
import { LuxuryImage } from "@/components/media";
import { COLLECTION_TILES } from "@/lib/media";

export function HomeCollections() {
  return (
    <section className="bg-linen/40 px-5 py-16 sm:px-8 md:py-24" aria-label="Explore our collections">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.28em] text-olive">Collections</p>
            <h2 className="mt-3 font-display text-3xl text-maroon md:text-5xl">Explore our collections</h2>
          </div>
          <Link
            href="/shop"
            className="font-body text-sm uppercase tracking-[0.18em] text-maroon underline-offset-4 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
          {COLLECTION_TILES.map((tile) => (
            <Link
              key={tile.slug}
              href={tile.href}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full border border-champagne/25 bg-ivory p-2 shadow-sm transition-transform duration-500 ease-luxury group-hover:-translate-y-1">
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <LuxuryImage
                    src={tile.image.src}
                    alt={tile.image.alt}
                    width={tile.image.width}
                    height={tile.image.height}
                    fit="cover"
                    sizes="(max-width: 768px) 45vw, 18vw"
                    className="h-full w-full"
                    imageClassName="transition-transform duration-700 ease-luxury group-hover:scale-[1.05]"
                  />
                </div>
                <FlowerMotif className="pointer-events-none absolute -right-1 -top-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-80" />
              </div>
              <p className="mt-4 font-display text-lg text-maroon">{tile.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
