"use client";

import { SectionDivider } from "@/components/ui/SectionDivider";
import { UnwrapIntro } from "./intro/UnwrapIntro";
import { Chapter5Hero } from "./chapters/Chapter5Hero";
import { ChapterCrafted } from "./chapters/ChapterCrafted";
import { ChapterCollections } from "./chapters/ChapterCollections";
import { ChapterCustomerStories } from "./chapters/ChapterCustomerStories";
import { ChapterDetailsMatter } from "./chapters/ChapterDetailsMatter";
import { ChapterFooter } from "./chapters/ChapterFooter";
import { ChapterInstagram } from "./chapters/ChapterInstagram";
import { ChapterMeetMakers } from "./chapters/ChapterMeetMakers";
import { ChapterNewsletter } from "./chapters/ChapterNewsletter";
import { ChapterThreadToTreasure } from "./chapters/ChapterThreadToTreasure";

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

export function HomePage() {
  return (
    <>
      <SkipToContentLink />
      <UnwrapIntro>
        <Chapter5Hero />
        <SectionDivider />
        <ChapterCrafted />
        <SectionDivider />
        <ChapterThreadToTreasure />
        <SectionDivider />
        <ChapterMeetMakers />
        <SectionDivider />
        <ChapterCollections />
        <SectionDivider />
        <ChapterDetailsMatter />
        <SectionDivider />
        <ChapterCustomerStories />
        <SectionDivider />
        <ChapterInstagram />
        <SectionDivider />
        <ChapterNewsletter />
        <ChapterFooter />
      </UnwrapIntro>
    </>
  );
}
