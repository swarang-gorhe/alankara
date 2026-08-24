import type { Metadata } from "next";
import Link from "next/link";
import { LuxuryImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import { JOURNAL_STORIES } from "@/lib/media";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Journal",
  description: "Notes from the Alankara atelier — cloth, thread, and the little moments we dress.",
  path: "/journal",
});

export default function JournalPage() {
  return (
    <div className="overflow-x-hidden bg-ivory">
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8 md:py-28">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-olive">Journal</p>
        <h1 className="mt-5 font-display text-5xl text-maroon md:text-7xl text-balance">
          Notes from the atelier
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg text-ink-muted">
          Stories about fabric jewellery, hand assembly, and dressing the hours that do not wait for
          a special occasion.
        </p>
      </section>
      <section className="mx-auto max-w-6xl space-y-24 px-5 pb-28 sm:px-8">
        {JOURNAL_STORIES.map((story, index) => (
          <article
            key={story.slug}
            className="grid items-center gap-10 md:grid-cols-12"
          >
            <div className={index % 2 === 1 ? "md:order-2 md:col-span-6" : "md:col-span-6"}>
              <LuxuryImage
                src={story.image.src}
                alt={story.image.alt}
                width={story.image.width}
                height={story.image.height}
                fit="cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="aspect-[4/5] w-full border border-champagne/15"
              />
            </div>
            <div className="md:col-span-6">
              <p className="font-body text-[11px] uppercase tracking-[0.28em] text-champagne">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">{story.title}</h2>
              <p className="mt-4 font-body text-lg leading-relaxed text-ink-muted">{story.excerpt}</p>
            </div>
          </article>
        ))}
      </section>
      <div className="pb-20 text-center">
        <Button asChild variant="outline">
          <Link href="/shop">Shop the collection</Link>
        </Button>
      </div>
    </div>
  );
}
