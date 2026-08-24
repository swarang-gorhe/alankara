"use client";

import { HomeHero } from "./commerce/HomeHero";
import { HomeCollections } from "./commerce/HomeCollections";
import { HomeProducts } from "./commerce/HomeProducts";
import { HomeMadeByHand } from "./commerce/HomeMadeByHand";
import { HomeCustomize } from "./commerce/HomeCustomize";
import { HomeMadeWithLove } from "./commerce/HomeMadeWithLove";
import { HomeSocial } from "./commerce/HomeSocial";
import { ChapterNewsletter } from "./chapters/ChapterNewsletter";
import { ChapterFooter } from "./chapters/ChapterFooter";
import { SeeItOnYouPromo } from "@/components/try-on/SeeItOnYouPromo";
import type { ProductFixture } from "@/lib/fixtures/types";

type HomePageProps = {
  products: ProductFixture[];
};

/** Commercial fabric-jewellery homepage — shop-first, not a chapter book. */
export function HomePage({ products }: HomePageProps) {
  return (
    <div className="overflow-x-hidden bg-ivory">
      <HomeHero />
      <HomeCollections />
      <HomeProducts products={products} />
      <SeeItOnYouPromo />
      <HomeMadeByHand />
      <HomeCustomize />
      <HomeMadeWithLove />
      <HomeSocial />
      <ChapterNewsletter />
      <ChapterFooter />
    </div>
  );
}
