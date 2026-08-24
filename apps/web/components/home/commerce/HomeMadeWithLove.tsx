"use client";

import { LuxuryImage } from "@/components/media";
import { FlowerMotif } from "@/components/brand/FlowerMotif";
import { ATELIER_MEDIA, MEDIA } from "@/lib/media";

export function HomeMadeWithLove() {
  return (
    <section className="relative overflow-hidden bg-linen/50 px-5 py-16 sm:px-8 md:py-20" aria-label="Made with love">
      <FlowerMotif className="pointer-events-none absolute -left-6 top-8 h-24 w-24 opacity-[0.07]" tone="maroon" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <LuxuryImage
          src={ATELIER_MEDIA.assemble.src}
          alt={ATELIER_MEDIA.assemble.alt}
          width={ATELIER_MEDIA.assemble.width}
          height={ATELIER_MEDIA.assemble.height}
          fit="cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="aspect-[4/3] w-full rounded-2xl border border-champagne/20"
        />
        <div>
          <h2 className="font-display text-3xl text-maroon md:text-4xl">Made by hand. Made with love.</h2>
          <p className="mt-5 max-w-md font-body text-base leading-relaxed text-ink-muted">
            Every Alankara piece begins with carefully selected fabric and is shaped, assembled and
            finished by hand.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <LuxuryImage
              src={MEDIA.pearls.src}
              alt=""
              width={120}
              height={120}
              fit="cover"
              sizes="64px"
              className="h-16 w-16 rounded-full border border-champagne/25"
            />
            <p className="font-script text-xl italic text-warm-brown">Fabric → design → wear</p>
          </div>
        </div>
      </div>
    </section>
  );
}
