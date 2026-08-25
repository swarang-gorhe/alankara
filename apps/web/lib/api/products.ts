import {
  fetchProductBySlug,
  fetchProductSlugs,
  fetchProducts,
  fetchReviewsForProduct,
} from "@/lib/api/client";
import {
  getProductBySlug as getFixtureProduct,
  getRelatedProducts,
  getReviewsForProduct,
  products as fixtureProducts,
} from "@/lib/fixtures";
import type { ProductFixture, ReviewFixture } from "@/lib/fixtures/types";

export async function getShopProducts(): Promise<ProductFixture[]> {
  try {
    const items = await fetchProducts();
    if (items.length > 0) {
      const bySlug = new Map(items.map((p) => [p.slug, normalizeProduct(p)]));
      for (const fixture of fixtureProducts) {
        const existing = bySlug.get(fixture.slug);
        if (!existing) {
          bySlug.set(fixture.slug, normalizeProduct(fixture));
          continue;
        }
        // Prefer fixture try-on calibration when API product is missing an asset
        if (!existing.tryOnAssetUrl && fixture.tryOnAssetUrl) {
          bySlug.set(
            fixture.slug,
            normalizeProduct({
              ...existing,
              tryOnEnabled: fixture.tryOnEnabled ?? existing.tryOnEnabled,
              tryOnAssetUrl: fixture.tryOnAssetUrl,
              tryOnKind: fixture.tryOnKind ?? existing.tryOnKind,
              tryOnScale: fixture.tryOnScale ?? existing.tryOnScale,
            }),
          );
        }
      }
      return Array.from(bySlug.values());
    }
  } catch {
    // fall through
  }
  return fixtureProducts.map(normalizeProduct);
}

export async function getProductPageData(slug: string): Promise<{
  product: ProductFixture;
  relatedProducts: ProductFixture[];
  productReviews: ReviewFixture[];
} | null> {
  try {
    const detail = await fetchProductBySlug(slug);
    if (detail) {
      const { relatedProducts = [], ...product } = detail;
      const productReviews = await fetchReviewsForProduct(product.id).catch(() =>
        getReviewsForProduct(product.id),
      );
      return {
        product: normalizeProduct(product),
        relatedProducts,
        productReviews: productReviews ?? [],
      };
    }
  } catch {
    // fall through to fixtures
  }

  // API null/404 or network error — still open fixture products so cards never dead-end
  const product = getFixtureProduct(slug);
  if (!product) {
    return null;
  }
  return {
    product: normalizeProduct(product),
    relatedProducts: getRelatedProducts(product.relatedSlugs ?? []),
    productReviews: getReviewsForProduct(product.id),
  };
}

function normalizeProduct(product: ProductFixture): ProductFixture {
  return {
    ...product,
    images: product.images ?? [],
    variants: product.variants ?? [],
    materials: product.materials ?? [],
    occasion: product.occasion ?? [],
    process: product.process ?? [],
    relatedSlugs: product.relatedSlugs ?? [],
    styleTags: product.styleTags ?? [],
    tryOnEnabled: product.tryOnEnabled ?? false,
    tryOnAssetUrl: product.tryOnAssetUrl ?? null,
    tryOnKind: product.tryOnKind,
  };
}

export async function getAllProductSlugs(): Promise<string[]> {
  const slugs = new Set<string>(fixtureProducts.map((p) => p.slug));
  try {
    const remote = await fetchProductSlugs();
    for (const slug of remote) slugs.add(slug);
  } catch {
    // fixtures only
  }
  return Array.from(slugs);
}
