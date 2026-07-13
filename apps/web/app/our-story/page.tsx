import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { ourStory } from "@/lib/fixtures";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Our Story",
  description:
    "The story behind Alankara — artisan partnerships, slow craft, and cloth jewellery made for life's little moments.",
  path: "/our-story",
});

export default function OurStoryPage() {
  const { hero, sections } = ourStory;

  return (
    <div className="bg-gradient-to-b from-ivory via-linen/30 to-cotton/40">
      <section className="relative overflow-hidden border-b border-champagne/10">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.04] via-transparent to-sage/10" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 md:py-28">
          <p className="font-script text-xl italic text-champagne md:text-2xl">{hero.eyebrow}</p>
          <h1 className="mt-6 font-display text-4xl leading-tight text-maroon md:text-6xl text-balance">
            {hero.title}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
            {hero.subtitle}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        {sections.map((section, index) => (
          <div key={section.id}>
            <section
              className={`grid gap-10 py-12 md:grid-cols-12 md:gap-16 md:py-20 ${
                index % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="flex flex-col justify-center md:col-span-5">
                <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">
                  Chapter {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-4 font-display text-3xl text-maroon md:text-4xl">{section.heading}</h2>
                {section.pullQuote && (
                  <blockquote className="mt-8 hidden border-l-2 border-champagne pl-5 md:block">
                    <p className="font-script text-xl italic leading-relaxed text-champagne">
                      &ldquo;{section.pullQuote}&rdquo;
                    </p>
                  </blockquote>
                )}
              </div>
              <div className="md:col-span-7">
                <p className="text-base leading-[1.85] text-ink md:text-lg">{section.body}</p>
                {section.pullQuote && (
                  <blockquote className="mt-8 border-l-2 border-champagne pl-5 md:hidden">
                    <p className="font-script text-lg italic leading-relaxed text-champagne">
                      &ldquo;{section.pullQuote}&rdquo;
                    </p>
                  </blockquote>
                )}
              </div>
            </section>
            {index < sections.length - 1 && <SectionDivider className="py-4" />}
          </div>
        ))}
      </article>

      <section className="border-t border-champagne/10 bg-ivory/80">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-24">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={80}
            height={80}
            className="mx-auto opacity-80"
          />
          <p className="mt-8 font-script text-lg italic text-champagne md:text-xl">
            Meet the hands behind the thread
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/artisans">Our artisans</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
