import { authFetch } from "@/lib/api/auth-fetch";

export type WishlistItem = {
  id: string;
  productId: string;
  variantId: string | null;
  productSlug: string;
  productName: string;
  createdAt: string;
};

export async function fetchWishlist(): Promise<WishlistItem[]> {
  return authFetch<WishlistItem[]>("/wishlist");
}

export async function addToWishlist(productId: string, variantId?: string): Promise<WishlistItem> {
  const qs = variantId ? `?variant_id=${encodeURIComponent(variantId)}` : "";
  return authFetch<WishlistItem>(`/wishlist/${productId}${qs}`, { method: "POST" });
}

export async function removeWishlistItem(itemId: string): Promise<void> {
  await authFetch<void>(`/wishlist/${itemId}`, { method: "DELETE" });
}
