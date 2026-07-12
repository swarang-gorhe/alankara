import type { Metadata } from "next";
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
    <div>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <p className="font-script text-xl italic text-champagne md:text-2xl">{hero.eyebrow}</p>
        <h1 className="mt-6 font-display text-4xl leading-tight text-maroon md:text-6xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted">
          {hero.subtitle}
        </p>
      </section>

      <SectionDivider />

      <article className="mx-auto max-w-3xl px-6 py-12">
        {sections.map((section, index) => (
          <div key={section.id}>
            <section className="py-12 md:py-16">
              <h2 className="font-display text-3xl text-maroon md:text-4xl">
                {section.heading}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-ink md:text-lg">
                {section.body}
              </p>
              {section.pullQuote && (
                <blockquote className="mt-8 border-l-2 border-champagne pl-6">
                  <p className="font-script text-xl italic leading-relaxed text-champagne md:text-2xl">
                    &ldquo;{section.pullQuote}&rdquo;
                  </p>
                </blockquote>
              )}
            </section>
            {index < sections.length - 1 && <SectionDivider className="py-4" />}
          </div>
        ))}
      </article>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <SectionDivider />
        <p className="mt-12 font-script text-lg italic text-champagne">Meet the hands behind the thread</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/artisans">Our artisans</Link>
        </Button>
      </section>
    </div>
  );
}
