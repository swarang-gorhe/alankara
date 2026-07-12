import aiInsightsData from "./ai-insights.json";
import artisansData from "./artisans.json";
import categoriesData from "./categories.json";
import ourStoryData from "./our-story.json";
import productsData from "./products.json";
import reviewsData from "./reviews.json";
import type {
  AIInsightsFixture,
  ArtisanFixture,
  CategoryFixture,
  CategorySlug,
  MaterialSlug,
  OurStoryFixture,
  ProductFixture,
  ReviewFixture,
  ShopFiltersState,
  StyleTag,
} from "./types";

export type {
  AIInsightsFixture,
  ArtisanFixture,
  CategoryFixture,
  CategorySlug,
  MaterialSlug,
  OurStoryFixture,
  ProductFixture,
  ReviewFixture,
  ShopFiltersState,
  StyleTag,
};

export {
  MATERIAL_LABELS,
  SHOP_STYLE_FILTERS,
  STYLE_LABELS,
} from "./shop";

export const categories = categoriesData as CategoryFixture[];
export const products = productsData as ProductFixture[];
export const reviews = reviewsData as ReviewFixture[];
export const artisans = artisansData as ArtisanFixture[];
export const ourStory = ourStoryData as OurStoryFixture;
export const aiInsights = aiInsightsData as AIInsightsFixture;

export function getProductBySlug(slug: string): ProductFixture | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: CategorySlug): ProductFixture[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getRelatedProducts(slugs: string[]): ProductFixture[] {
  return slugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is ProductFixture => p !== undefined);
}

export function getReviewsForProduct(productId: string): ReviewFixture[] {
  return reviews.filter((r) => r.productId === productId && r.approved);
}

export function getArtisanBySlug(slug: string): ArtisanFixture | undefined {
  return artisans.find((a) => a.slug === slug);
}

export const PRICE_RANGES = [
  { id: "under-2000", label: "Under ₹2,000", min: 0, max: 1999 },
  { id: "2000-5000", label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { id: "5000-10000", label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { id: "above-10000", label: "Above ₹10,000", min: 10001, max: Infinity },
] as const;

export type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

export function formatPrice(amount: number, currency = "INR"): string {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
}
