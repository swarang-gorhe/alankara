"use client";

import Link from "next/link";
import { useRef } from "react";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { Button } from "@/components/ui/button";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import type { ProductFixture } from "@/lib/fixtures/types";
import { LuxuryImage } from "@/components/media";
import { MEDIA } from "@/lib/media";

type ChapterCollectionProps = {
  products: ProductFixture[];
};

export function ChapterCollection({ products }: ChapterCollectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "scale-in", stagger: 0.08 });

  const pieces = products.slice(0, 4);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-cotton/40 via-ivory to-linen/40 px-5 py-24 md:px-8 md:py-36"
      aria-label="The collection"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-olive">
              Chapter 05 — The collection
            </p>
            <h2 className="mt-5 font-display text-4xl text-maroon md:text-6xl text-balance">
              Cloth jewellery, in two tempos
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/shop">Enter the atelier</Link>
          </Button>
        </div>

        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6"
        >
          {pieces[0] && (
            <div data-reveal className="lg:col-span-5">
              <EditorialProductCard product={pieces[0]} layout="portrait" />
            </div>
          )}
          <div data-reveal className="hidden lg:col-span-7 lg:block">
            <LuxuryImage
              src={MEDIA.yarnMacro.src}
              alt={MEDIA.yarnMacro.alt}
              width={MEDIA.yarnMacro.width}
              height={MEDIA.yarnMacro.height}
              fit="cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="aspect-[16/11] w-full border border-champagne/15"
            />
            <p className="mt-4 max-w-sm font-script text-xl italic text-warm-brown">
              Bigger drops at ₹160. Smaller studs at ₹130. Same cloth, different presence.
            </p>
          </div>
          {pieces[1] && (
            <div data-reveal className="lg:col-span-5">
              <EditorialProductCard product={pieces[1]} layout="portrait" />
            </div>
          )}
          {pieces[2] && (
            <div data-reveal className="sm:col-span-1 lg:col-span-4">
              <EditorialProductCard product={pieces[2]} layout="square" />
            </div>
          )}
          {pieces[3] && (
            <div data-reveal className="sm:col-span-1 lg:col-span-8">
              <EditorialProductCard product={pieces[3]} layout="wide" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
