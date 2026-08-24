"use client";

import Link from "next/link";
import { LuxuryImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import { FlowerDivider } from "@/components/brand/FlowerMotif";
import { ATELIER_MEDIA } from "@/lib/media";

const FABRICS = ["Floral", "Pastel", "Earthy", "Bold", "Minimal"] as const;
const SHAPES = ["Round", "Floral", "Drop", "Jhumka-inspired", "Statement"] as const;
const DETAILS = ["Pearls", "Beads", "Ghungroos", "Tassels", "Gold-tone"] as const;

export function HomeCustomize() {
  return (
    <section className="bg-ivory px-5 py-16 sm:px-8 md:py-24" aria-label="Make it yours">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.28em] text-olive">Customize</p>
          <h2 className="mt-3 font-display text-3xl text-maroon md:text-5xl">Make it yours</h2>
          <FlowerDivider className="mt-6 justify-start" />
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-ink-muted">
            Choose your fabric. Choose your shape. Add your details. We&apos;ll handcraft it for you.
          </p>

          <div className="mt-8 space-y-6">
            <Chooser label="Choose fabric" options={FABRICS} />
            <Chooser label="Choose shape" options={SHAPES} />
            <Chooser label="Choose details" options={DETAILS} />
          </div>

          <Button asChild className="mt-8">
            <Link href="/customize">Start customizing</Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-champagne/20 bg-linen/30 shadow-luxury">
          <LuxuryImage
            src={ATELIER_MEDIA.customize.src}
            alt={ATELIER_MEDIA.customize.alt}
            width={ATELIER_MEDIA.customize.width}
            height={ATELIER_MEDIA.customize.height}
            fit="cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-[4/3] w-full"
          />
        </div>
      </div>
    </section>
  );
}

function Chooser({ label, options }: { label: string; options: readonly string[] }) {
  return (
    <div>
      <p className="font-body text-[11px] uppercase tracking-[0.22em] text-olive">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <span
            key={option}
            className="rounded-full border border-champagne/30 bg-cotton/50 px-3.5 py-1.5 font-body text-sm text-ink"
          >
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
