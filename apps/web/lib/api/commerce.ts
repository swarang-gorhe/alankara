import { API_URL } from "@/lib/api/client";
import type { ProductFixture } from "@/lib/fixtures/types";

async function cookieFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }
  const { getAccessToken } = await import("@/lib/auth/adapter");
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function logCustomerEvent(productId: string, eventType: "viewed" | "added_to_cart") {
  try {
    await cookieFetch("/events", {
      method: "POST",
      body: JSON.stringify({ productId, eventType }),
    });
  } catch {
    // Event logging is best-effort and must never block shopping.
  }
}

export async function fetchRecommendations(options?: {
  surface?: "home" | "pdp";
  productId?: string;
  limit?: number;
}): Promise<{ headline: string; items: ProductFixture[] }> {
  const params = new URLSearchParams({
    surface: options?.surface ?? "home",
    limit: String(options?.limit ?? 6),
  });
  if (options?.productId) params.set("product_id", options.productId);
  return cookieFetch(`/recommendations?${params.toString()}`);
}

export async function submitReview(body: {
  productId: string;
  rating: number;
  title?: string;
  text: string;
  authorName?: string;
  authorEmail?: string;
}): Promise<{ id: string; status: string }> {
  return cookieFetch("/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
