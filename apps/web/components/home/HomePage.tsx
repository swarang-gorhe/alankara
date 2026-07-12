"use client";

import { useState } from "react";
import { ChapterBloom } from "./chapters/ChapterBloom";
import { ChapterCollections } from "./chapters/ChapterCollections";
import { ChapterCrafted } from "./chapters/ChapterCrafted";
import { ChapterCustomerStories } from "./chapters/ChapterCustomerStories";
import { ChapterDetailsMatter } from "./chapters/ChapterDetailsMatter";
import { ChapterFooter } from "./chapters/ChapterFooter";
import { ChapterInstagram } from "./chapters/ChapterInstagram";
import { ChapterMeetMakers } from "./chapters/ChapterMeetMakers";
import { ChapterNewsletter } from "./chapters/ChapterNewsletter";
import { ChapterThreadToTreasure } from "./chapters/ChapterThreadToTreasure";
import { LoadingScreen } from "./LoadingScreen";
import { SectionDivider } from "@/components/ui/SectionDivider";

export function HomePage() {
  const [ready, setReady] = useState(false);

  return (
    <>
      {!ready && <LoadingScreen onComplete={() => setReady(true)} />}

      <div
        className="relative overflow-x-hidden transition-opacity duration-slow ease-luxury"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <ChapterBloom />
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
      </div>
    </>
  );
}
