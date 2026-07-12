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
    return await fetchProducts();
  } catch {
    return fixtureProducts;
  }
}

export async function getProductPageData(slug: string): Promise<{
  product: ProductFixture;
  relatedProducts: ProductFixture[];
  productReviews: ReviewFixture[];
} | null> {
  try {
    const detail = await fetchProductBySlug(slug);
    if (!detail) {
      return null;
    }
    const { relatedProducts, ...product } = detail;
    const productReviews = await fetchReviewsForProduct(product.id).catch(() =>
      getReviewsForProduct(product.id),
    );
    return { product, relatedProducts, productReviews };
  } catch {
    const product = getFixtureProduct(slug);
    if (!product) {
      return null;
    }
    return {
      product,
      relatedProducts: getRelatedProducts(product.relatedSlugs),
      productReviews: getReviewsForProduct(product.id),
    };
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    return await fetchProductSlugs();
  } catch {
    return fixtureProducts.map((p) => p.slug);
  }
}
