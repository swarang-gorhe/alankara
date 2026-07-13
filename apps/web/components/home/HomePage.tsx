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

/** Pitch homepage — seven sections, restrained motion */
export function HomePage() {
  return (
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
  );
}
