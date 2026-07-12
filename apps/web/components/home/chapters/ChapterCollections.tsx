"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { cn } from "@/lib/utils";

const collections = [
  {
    id: "earrings",
    name: "Fabric Earrings",
    description: "Lightweight jhumkas and drops — cotton, embroidery, and pearl-thread sway.",
    href: "/shop?category=cloth-earrings",
    span: "md:col-span-7 md:row-span-2",
    accent: "from-maroon/8 to-champagne/5",
  },
  {
    id: "necklaces",
    name: "Thread & Pearl",
    description: "Chokers and long strands knotted by hand on silk and cotton cord.",
    href: "/shop?category=fabric-necklaces",
    span: "md:col-span-5",
    accent: "from-olive/10 to-cotton",
  },
  {
    id: "hair",
    name: "Hair Adornments",
    description: "Gajras, pins, and braided thread pieces for buns and braids.",
    href: "/shop?category=hair-accessories",
    span: "md:col-span-5",
    accent: "from-sage/15 to-ivory",
  },
  {
    id: "sets",
    name: "Curated Sets",
    description: "Matched earrings and collars — small-batch coordinates for gifting.",
    href: "/shop?category=jewellery-sets",
    span: "md:col-span-7",
    accent: "from-warm-brown/8 to-linen",
  },
];

export function ChapterCollections() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "clip-up", stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-24 md:py-32"
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
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-opacity duration-slow ease-luxury",
                    collection.accent,
                    isHovered ? "opacity-100" : "opacity-60",
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
