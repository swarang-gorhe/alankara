import type { Product, Review } from "@alankara/shared";

export type CategorySlug =
  | "cloth-earrings"
  | "fabric-necklaces"
  | "fabric-bracelets"
  | "fabric-rings"
  | "hair-accessories"
  | "jewellery-sets"
  | "embroidered-textile-jewellery"
  | "sustainable-fashion-accessories";

export type MaterialSlug =
  | "embroidery"
  | "pearls"
  | "cotton"
  | "silk-thread"
  | "zari"
  | "ghungroos";

export type StyleTag =
  | "embroidery"
  | "pearls"
  | "cotton"
  | "minimal"
  | "statement"
  | "boho"
  | "earthy"
  | "pastel"
  | "traditional";

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
  styleTags: StyleTag[];
  comfort?: string;
  packaging?: string;
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
  status: "placeholder" | "live";
  summary: string;
  positiveThemes: string[];
  concerns: string[];
  trendingPraise: string[];
  lastUpdated: string | null;
};

export type ShopFiltersState = {
  categories: CategorySlug[];
  styles: StyleTag[];
  priceRange: import("./index").PriceRangeId | null;
};
