"use client";

import { ChapterCollection } from "./chapters/ChapterCollection";
import { ChapterCustomerStories } from "./chapters/ChapterCustomerStories";
import { ChapterDetails } from "./chapters/ChapterDetails";
import { ChapterFooter } from "./chapters/ChapterFooter";
import { ChapterJournal } from "./chapters/ChapterJournal";
import { ChapterMadeByHand } from "./chapters/ChapterMadeByHand";
import { ChapterMaterial } from "./chapters/ChapterMaterial";
import { ChapterMoments } from "./chapters/ChapterMoments";
import { ChapterNewsletter } from "./chapters/ChapterNewsletter";
import { ChapterStyle } from "./chapters/ChapterStyle";
import { UnwrapIntro } from "./intro/UnwrapIntro";
import { KeepsakeScene } from "./intro/KeepsakeScene";
import { JournalSpread } from "@/components/journal";
import type { ProductFixture } from "@/lib/fixtures/types";

type HomePageProps = {
  products: ProductFixture[];
};

export function HomePage({ products }: HomePageProps) {
  return (
    <UnwrapIntro>
      <JournalSpread>
        <KeepsakeScene />
        <ChapterMoments />
        <ChapterMaterial />
        <ChapterMadeByHand />
        <ChapterCollection products={products} />
        <ChapterDetails />
        <ChapterStyle />
        <ChapterCustomerStories />
        <ChapterJournal />
        <ChapterNewsletter />
        <ChapterFooter />
      </JournalSpread>
    </UnwrapIntro>
  );
}
