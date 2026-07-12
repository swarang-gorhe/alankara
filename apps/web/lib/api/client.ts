import type {
  ArtisanFixture,
  ProductFixture,
  ReviewFixture,
} from "@/lib/fixtures/types";

const LOCAL_DEV_API_URL = "http://localhost:8000";

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured && configured !== "undefined" && configured !== "null") {
    return configured.replace(/\/$/, "");
  }

  // On Vercel, avoid defaulting to loopback — it triggers CORS/private-network errors in the browser.
  if (process.env.VERCEL) {
    return "";
  }

  return LOCAL_DEV_API_URL;
}

const API_URL = resolveApiUrl();

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new ApiError("API URL is not configured (NEXT_PUBLIC_API_URL is unset)", 503);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new ApiError(`API ${path} failed (${res.status})`, res.status);
  }

  return res.json() as Promise<T>;
}

export async function fetchProducts(pageSize = 100): Promise<ProductFixture[]> {
  const data = await apiFetch<Paginated<ProductFixture>>(
    `/products?page_size=${pageSize}`,
  );
  return data.items;
}

export type ProductDetailResponse = ProductFixture & {
  relatedProducts: ProductFixture[];
};

export async function fetchProductBySlug(slug: string): Promise<ProductDetailResponse | null> {
  try {
    return await apiFetch<ProductDetailResponse>(`/products/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchProductSlugs(): Promise<string[]> {
  const products = await fetchProducts();
  return products.map((p) => p.slug);
}

export async function fetchReviews(pageSize = 100): Promise<ReviewFixture[]> {
  const data = await apiFetch<Paginated<ReviewFixture>>(`/reviews?page_size=${pageSize}`);
  return data.items;
}

export async function fetchReviewsForProduct(productId: string): Promise<ReviewFixture[]> {
  const data = await apiFetch<Paginated<ReviewFixture>>(
    `/reviews?product_id=${encodeURIComponent(productId)}&page_size=50`,
  );
  return data.items;
}

export async function fetchArtisans(): Promise<ArtisanFixture[]> {
  return apiFetch<ArtisanFixture[]>("/artisans");
}

export { API_URL };
