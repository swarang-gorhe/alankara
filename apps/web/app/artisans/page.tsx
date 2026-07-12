import type { Metadata } from "next";
import Link from "next/link";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { artisans } from "@/lib/fixtures";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Artisans",
  description:
    "Meet the master craftspeople behind Alankara — zari embroiderers, block printers, silk thread weavers, and upcycled fabric innovators.",
  path: "/artisans",
});

export default function ArtisansPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="font-script text-xl italic text-champagne md:text-2xl">Meet the crafters</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-maroon md:text-5xl">
          The artisan collective
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-muted">
          Alankara is a bridge between workshop floors and your wardrobe. Each artisan brings
          decades of textile technique — and a voice we are proud to amplify.
        </p>
      </section>

      <SectionDivider />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="space-y-20">
          {artisans.map((artisan, index) => (
            <article
              key={artisan.id}
              className="grid gap-8 md:grid-cols-12 md:gap-12"
            >
              <div
                className={`md:col-span-5 ${index % 2 === 1 ? "md:order-2" : ""}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-sage/30 bg-gradient-to-br from-linen via-ivory to-cotton">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <p className="font-display text-5xl text-maroon/20 md:text-6xl">
                        {artisan.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </p>
                      <span className="mt-4 inline-block rounded-sm border border-champagne/40 bg-ivory/80 px-2 py-0.5 font-body text-[10px] uppercase tracking-widest text-ink-muted">
                        portrait pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex flex-col justify-center md:col-span-7 ${index % 2 === 1 ? "md:order-1" : ""}`}
              >
                <p className="font-body text-xs uppercase tracking-widest text-champagne">
                  {artisan.location} · {artisan.yearsExperience} years
                </p>
                <h2 className="mt-2 font-display text-3xl text-maroon md:text-4xl">
                  {artisan.name}
                </h2>
                <p className="mt-1 text-sm italic text-ink-muted">{artisan.title}</p>

                <p className="mt-6 leading-relaxed text-ink">{artisan.bio}</p>

                <blockquote className="mt-6 border-l-2 border-champagne pl-4">
                  <p className="font-script text-lg italic text-champagne">
                    &ldquo;{artisan.quote}&rdquo;
                  </p>
                </blockquote>

                <div className="mt-6 flex flex-wrap gap-2">
                  {artisan.specialty.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-sm border border-sage/40 bg-linen px-3 py-1 text-xs text-ink-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 text-center">
          <SectionDivider />
          <p className="mt-12 font-script text-lg italic text-champagne">
            Every piece carries their signature
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Shop the collection</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
