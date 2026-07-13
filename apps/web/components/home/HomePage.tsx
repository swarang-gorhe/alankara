"use client";

import { Chapter5Hero } from "./chapters/Chapter5Hero";
import { ChapterBrandStatement } from "./chapters/ChapterBrandStatement";
import { ChapterCrafted } from "./chapters/ChapterCrafted";
import { ChapterCollections } from "./chapters/ChapterCollections";
import { ChapterCustomerStories } from "./chapters/ChapterCustomerStories";
import { ChapterFooter } from "./chapters/ChapterFooter";
import { ChapterMeetMakers } from "./chapters/ChapterMeetMakers";
import { ChapterNewsletter } from "./chapters/ChapterNewsletter";
import { ChapterThreadToTreasure } from "./chapters/ChapterThreadToTreasure";
import { UnwrapIntro } from "./intro/UnwrapIntro";

function SkipToContentLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-sm focus:bg-ivory focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:text-maroon focus:shadow-luxury focus:ring-2 focus:ring-champagne"
    >
      Skip to content
    </a>
  );
}

/** Pitch homepage — seven sections, restrained motion */
export function HomePage() {
  return (
    <>
      <SkipToContentLink />
      <UnwrapIntro>
        <Chapter5Hero />
        <ChapterBrandStatement />
        <ChapterCrafted />
        <ChapterThreadToTreasure />
        <ChapterMeetMakers />
        <ChapterCollections />
        <ChapterCustomerStories />
        <ChapterNewsletter />
        <ChapterFooter />
      </UnwrapIntro>
    </>
  );
}
