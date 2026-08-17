"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { cn } from "@/lib/utils";

const collections = [
  {
    id: "bigger",
    name: "Bigger Earrings",
    description: "Statement drops in mustard, cocoa, and geometric textile — ₹160 a pair.",
    href: "/shop?size=Bigger",
    span: "md:col-span-7 md:row-span-2",
    accent: "from-maroon/8 to-champagne/5",
  },
  {
    id: "smaller",
    name: "Smaller Earrings",
    description: "Everyday studs with a quiet presence — forest green and burgundy, ₹130 a pair.",
    href: "/shop?size=Smaller",
    span: "md:col-span-5",
    accent: "from-olive/10 to-cotton",
  },
  {
    id: "drops",
    name: "Statement Drops",
    description: "Diamond and crescent silhouettes that move with you from chai to evening.",
    href: "/shop?style=statement",
    span: "md:col-span-5",
    accent: "from-sage/15 to-ivory",
  },
  {
    id: "studs",
    name: "Everyday Studs",
    description: "Compact hearts and rounds — small-batch coordinates for gifting.",
    href: "/shop?style=minimal",
    span: "md:col-span-7",
    accent: "from-warm-brown/8 to-linen",
  },
];

const collectionImages: Record<string, string> = {
  bigger: "/products/kesari-diamond-drops.webp",
  smaller: "/products/vanam-textile-studs.webp",
  drops: "/products/cocoa-crescent-drops.webp",
  studs: "/products/raga-heart-studs.webp",
};

export function ChapterCollections() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "clip-up", stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-sage/10 via-ivory to-linen/50 px-6 py-24 md:py-32"
      aria-label="The Collection"
    >
      <FabricTexture id="collections" opacity={0.04} />

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">Collections</p>
            <h2 className="mt-4 font-display text-3xl text-maroon md:text-5xl">
              Pieces that unfold like fabric
            </h2>
          </div>
          <Button variant="outline" data-magnetic asChild>
            <Link href="/shop" data-cursor-sparkle>
              View catalogue
            </Link>
          </Button>
        </div>

        <div
          ref={gridRef}
          className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-12 md:gap-6"
        >
          {collections.map((collection) => {
            const isHovered = hoveredId === collection.id;
            return (
              <Link
                key={collection.id}
                href={collection.href}
                data-reveal
                data-cursor-sparkle
                className={cn(
                  "group relative overflow-hidden rounded-sm border border-sage/30 bg-linen",
                  collection.span,
                )}
                onMouseEnter={() => setHoveredId(collection.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Image
                  src={collectionImages[collection.id]}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-slow ease-luxury group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/75 to-ivory/20"
                  aria-hidden="true"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-opacity duration-slow ease-luxury",
                    collection.accent,
                    isHovered ? "opacity-30" : "opacity-10",
                  )}
                  aria-hidden="true"
                />
                <div className="relative flex h-full min-h-[180px] flex-col justify-end p-8">
                  <div
                    className={cn(
                      "mb-4 h-1 bg-gradient-to-r from-champagne to-transparent transition-all duration-slow ease-luxury",
                      isHovered ? "w-full" : "w-1/3",
                    )}
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-2xl text-maroon transition-transform duration-base ease-luxury group-hover:-translate-y-1">
                    {collection.name}
                  </h3>
                  <p className="mt-2 max-w-sm font-body text-sm text-ink-muted">
                    {collection.description}
                  </p>
                  <span className="mt-4 font-body text-xs uppercase tracking-widest text-champagne opacity-0 transition-opacity duration-base group-hover:opacity-100">
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
