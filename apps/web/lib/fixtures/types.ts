import type { Product, Review } from "@alankara/shared";

export type CategorySlug =
  | "earrings"
  | "necklaces"
  | "bracelets"
  | "clothing-jewellery";

export type MaterialSlug =
  | "gold-plated"
  | "silver"
  | "kundan"
  | "pearl"
  | "silk-thread"
  | "zari";

export type ProcessStep = {
  title: string;
  description: string;
};

export type ProductFixture = Product & {
  categorySlug: CategorySlug;
  occasion: string[];
  process: ProcessStep[];
  relatedSlugs: string[];
  primaryMaterial: MaterialSlug;
  /** Lowest variant price in INR — used for shop filters */
  minPrice: number;
};

export type CategoryFixture = {
  slug: CategorySlug;
  name: string;
  description: string;
};

export type ReviewFixture = Review & {
  productSlug: string;
  productName: string;
  categorySlug: CategorySlug;
};

export type ArtisanFixture = {
  id: string;
  slug: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  specialty: string[];
  yearsExperience: number;
  quote: string;
};

export type OurStorySection = {
  id: string;
  heading: string;
  body: string;
  pullQuote?: string;
};

export type OurStoryFixture = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  sections: OurStorySection[];
};

export type AIInsightsFixture = {
  status: "placeholder";
  summary: string;
  positiveThemes: string[];
  concerns: string[];
  trendingPraise: string[];
  lastUpdated: string;
};
