import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LuxuryImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import { JOURNAL_STORIES, getJournalStory } from "@/lib/media";
import { createPageMetadata } from "@/lib/seo/metadata";

type JournalArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return JOURNAL_STORIES.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: JournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getJournalStory(slug);
  if (!story) return { title: "Note not found" };
  return createPageMetadata({
    title: story.title,
    description: story.excerpt,
    path: `/journal/${slug}`,
    image: story.image.src,
  });
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const { slug } = await params;
  const story = getJournalStory(slug);
  if (!story) notFound();

  return (
    <article className="overflow-x-hidden bg-ivory">
      <header className="mx-auto max-w-3xl px-5 py-16 sm:px-8 md:py-24">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-olive">Journal</p>
        <h1 className="mt-5 font-display text-4xl text-maroon text-balance md:text-6xl">
          {story.title}
        </h1>
        <p className="mt-6 font-body text-lg leading-relaxed text-ink-muted">{story.excerpt}</p>
      </header>
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <LuxuryImage
          src={story.image.src}
          alt={story.image.alt}
          width={story.image.width}
          height={story.image.height}
          fit="cover"
          priority
          sizes="(max-width: 768px) 100vw, 960px"
          className="aspect-[16/10] w-full border border-champagne/15"
        />
      </div>
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-14 sm:px-8 md:py-20">
        {story.body.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="font-body text-lg leading-relaxed text-ink">
            {paragraph}
          </p>
        ))}
        <div className="pt-8">
          <Button asChild variant="outline">
            <Link href="/journal">All notes</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
