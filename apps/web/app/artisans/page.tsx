import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { artisans } from "@/lib/fixtures";
import { createPageMetadata } from "@/lib/seo/metadata";

const artisanImages = [
  "/products/disc-necklace.webp",
  "/products/navy-jhumkas.webp",
  "/products/floral-hair-barrette.webp",
  "/products/beaded-bracelet.webp",
];

export const metadata: Metadata = createPageMetadata({
  title: "Artisans",
  description:
    "Meet the master craftspeople behind Alankara — zari embroiderers, block printers, silk thread weavers, and upcycled fabric innovators.",
  path: "/artisans",
});

export default function ArtisansPage() {
  return (
    <div className="bg-gradient-to-b from-ivory via-linen/25 to-cotton/40">
      <section className="border-b border-champagne/10 bg-ivory/90">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-24">
          <p className="font-script text-xl italic text-champagne md:text-2xl">Meet the crafters</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-maroon md:text-5xl">
            The artisan collective
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Alankara is a bridge between workshop floors and your wardrobe. Each artisan brings
            decades of textile technique — and a voice we are proud to amplify.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
        <div className="space-y-24 md:space-y-32">
          {artisans.map((artisan, index) => (
            <article
              key={artisan.id}
              className="grid items-center gap-10 md:grid-cols-12 md:gap-14"
            >
              <div className={`md:col-span-5 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-sage/25 bg-ivory shadow-luxury">
                  <Image
                    src={artisanImages[index % artisanImages.length]}
                    alt={`Craft detail by ${artisan.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/30 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-body text-[10px] uppercase tracking-widest text-ivory/90">
                      Studio detail
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`flex flex-col justify-center md:col-span-7 ${index % 2 === 1 ? "md:order-1" : ""}`}
              >
                <p className="font-body text-xs uppercase tracking-widest text-champagne">
                  {artisan.location} · {artisan.yearsExperience} years
                </p>
                <h2 className="mt-2 font-display text-3xl text-maroon md:text-4xl">{artisan.name}</h2>
                <p className="mt-1 text-sm italic text-ink-muted">{artisan.title}</p>

                <p className="mt-6 text-base leading-[1.8] text-ink md:text-lg">{artisan.bio}</p>

                <blockquote className="mt-8 border-l-2 border-champagne pl-5">
                  <p className="font-script text-lg italic text-champagne md:text-xl">
                    &ldquo;{artisan.quote}&rdquo;
                  </p>
                </blockquote>

                <div className="mt-6 flex flex-wrap gap-2">
                  {artisan.specialty.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-sage/40 bg-ivory px-3 py-1 text-xs text-ink-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-24 text-center md:mt-32">
          <SectionDivider />
          <p className="mt-12 font-script text-lg italic text-champagne md:text-xl">
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
