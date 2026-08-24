"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LuxuryImage } from "@/components/media";
import { FlowerDivider, FlowerMotif } from "@/components/brand/FlowerMotif";
import { Button } from "@/components/ui/button";
import { ATELIER_MEDIA } from "@/lib/media";
import { cn } from "@/lib/utils";

const FABRICS = [
  { id: "floral", label: "Floral", swatch: "bg-[#c45c4a]" },
  { id: "pastel", label: "Pastel", swatch: "bg-[#e8c9b8]" },
  { id: "earthy", label: "Earthy", swatch: "bg-[#8b5a2b]" },
  { id: "bold", label: "Bold", swatch: "bg-[#6f2317]" },
  { id: "minimal", label: "Minimal", swatch: "bg-[#ede5d6]" },
] as const;

const SHAPES = ["Round", "Floral", "Drop", "Jhumka-inspired", "Statement"] as const;
const DETAILS = ["Pearls", "Beads", "Ghungroos", "Tassels", "Gold-tone"] as const;

export function CustomizeClient() {
  const [fabric, setFabric] = useState<(typeof FABRICS)[number]["id"]>("floral");
  const [shape, setShape] = useState<(typeof SHAPES)[number]>("Round");
  const [detail, setDetail] = useState<(typeof DETAILS)[number]>("Pearls");

  const summary = useMemo(() => {
    const fabricLabel = FABRICS.find((f) => f.id === fabric)?.label ?? fabric;
    return `${fabricLabel} · ${shape} · ${detail}`;
  }, [fabric, shape, detail]);

  return (
    <div className="overflow-x-hidden bg-ivory">
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <p className="font-body text-[11px] uppercase tracking-[0.28em] text-olive">Customize</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl text-maroon md:text-6xl text-balance">
          Make it yours
        </h1>
        <FlowerDivider className="mt-6 justify-start" />
        <p className="mt-6 max-w-xl font-body text-lg text-ink-muted">
          Choose your fabric. Choose your shape. Add your details. We&apos;ll handcraft it for you.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-champagne/20 bg-linen/40">
          <LuxuryImage
            src={ATELIER_MEDIA.customize.src}
            alt={ATELIER_MEDIA.customize.alt}
            width={ATELIER_MEDIA.customize.width}
            height={ATELIER_MEDIA.customize.height}
            fit="cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-[4/3] w-full"
          />
          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-champagne/30 bg-ivory/95 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <FlowerMotif className="h-4 w-4" />
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-olive">Your piece</p>
            </div>
            <p className="mt-2 font-display text-xl text-maroon">{summary}</p>
          </div>
        </div>

        <div className="space-y-8">
          <fieldset>
            <legend className="font-body text-[11px] uppercase tracking-[0.22em] text-olive">
              Choose fabric
            </legend>
            <div className="mt-4 flex flex-wrap gap-3">
              {FABRICS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFabric(item.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-2 font-body text-sm transition-colors",
                    fabric === item.id
                      ? "border-maroon bg-maroon text-ivory"
                      : "border-champagne/30 text-ink hover:border-maroon/40",
                  )}
                >
                  <span className={cn("h-4 w-4 rounded-full border border-white/40", item.swatch)} />
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-body text-[11px] uppercase tracking-[0.22em] text-olive">
              Choose shape
            </legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {SHAPES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setShape(item)}
                  className={cn(
                    "rounded-full border px-4 py-2 font-body text-sm",
                    shape === item
                      ? "border-maroon bg-maroon text-ivory"
                      : "border-champagne/30 text-ink hover:border-maroon/40",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-body text-[11px] uppercase tracking-[0.22em] text-olive">
              Choose details
            </legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {DETAILS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDetail(item)}
                  className={cn(
                    "rounded-full border px-4 py-2 font-body text-sm",
                    detail === item
                      ? "border-maroon bg-maroon text-ivory"
                      : "border-champagne/30 text-ink hover:border-maroon/40",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href={`/contact?custom=${encodeURIComponent(summary)}`}>Request this piece</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Browse ready pieces</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
