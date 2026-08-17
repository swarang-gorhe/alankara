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
  EARRING_SIZES,
  MATERIAL_LABELS,
  SHOP_STYLE_FILTERS,
  STYLE_LABELS,
} from "./shop";
export type { EarringSize } from "./shop";

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

export function getRelatedProducts(slugs: string[] | undefined): ProductFixture[] {
  return (slugs ?? [])
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is ProductFixture => p !== undefined);
}

export function getReviewsForProduct(productId: string): ReviewFixture[] {
  return reviews.filter((r) => r.productId === productId && r.approved);
}

export function getArtisanBySlug(slug: string): ArtisanFixture | undefined {
  return artisans.find((a) => a.slug === slug);
}

export function getProductSize(product: ProductFixture): string | undefined {
  return product.variants.find((variant) => variant.size)?.size;
}

export const PRICE_RANGES = [
  { id: "under-150", label: "Under ₹150", min: 0, max: 149 },
  { id: "150-200", label: "₹150 – ₹200", min: 150, max: 200 },
  { id: "above-200", label: "Above ₹200", min: 201, max: Infinity },
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
