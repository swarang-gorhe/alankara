"use client";

import { ArtisanStoryScene } from "./ArtisanStoryScene";
import { CollectionsScene } from "./CollectionsScene";
import { HomeFooterSection } from "./HomeFooterSection";
import { InstagramScene } from "./InstagramScene";
import { ReviewsScene } from "./ReviewsScene";
import { TaglineScene } from "./TaglineScene";
import { TimelineScene } from "./TimelineScene";
import { WelcomeScene } from "./WelcomeScene";
import { SectionDivider } from "@/components/ui/SectionDivider";

export function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      <WelcomeScene />
      <SectionDivider />
      <TaglineScene />
      <SectionDivider />
      <ArtisanStoryScene />
      <SectionDivider />
      <CollectionsScene />
      <SectionDivider />
      <TimelineScene />
      <SectionDivider />
      <ReviewsScene />
      <SectionDivider />
      <InstagramScene />
      <SectionDivider />
      <HomeFooterSection />
    </div>
  );
}
