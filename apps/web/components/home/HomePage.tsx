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
import { FeatureBar } from "./FeatureBar";
import { UnwrapIntro } from "./intro/UnwrapIntro";
import { JournalSpread } from "@/components/journal";

/** Pitch homepage — seven sections, restrained motion */
export function HomePage() {
  return (
    <UnwrapIntro>
      <JournalSpread>
        <Chapter5Hero />
        <FeatureBar />
        <ChapterBrandStatement />
      <ChapterCrafted />
      <ChapterThreadToTreasure />
      <ChapterMeetMakers />
      <ChapterCollections />
      <ChapterCustomerStories />
      <ChapterNewsletter />
        <ChapterFooter />
      </JournalSpread>
    </UnwrapIntro>
  );
}
