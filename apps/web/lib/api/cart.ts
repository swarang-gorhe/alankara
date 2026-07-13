import type { Order } from "@alankara/shared";
import { API_URL } from "@/lib/api/client";

export type CartItemDetail = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPrice: { amount: number; currency: string };
  lineTotal: { amount: number; currency: string };
  stock: number;
  image?: string | null;
};

export type CartResponse = {
  id: string;
  items: CartItemDetail[];
  itemCount: number;
  subtotal: { amount: number; currency: string };
  updatedAt: string;
};

export type ShippingAddress = {
  name: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};

export type CheckoutResponse = {
  order: Order & {
    email: string;
    phone?: string;
    items: Array<{
      id: string;
      productId: string;
      variantId: string;
      productName: string;
      variantLabel?: string;
      sku: string;
      quantity: number;
      unitPrice: { amount: number; currency: string };
      lineTotal: { amount: number; currency: string };
    }>;
    subtotal: { amount: number; currency: string };
    total: { amount: number; currency: string };
    shippingAddress: ShippingAddress;
    createdAt: string;
  };
  payment: {
    status: string;
    provider: string;
    message?: string;
  };
};

async function cartFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("Cart API is not configured (NEXT_PUBLIC_API_URL is unset)");
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
    const body = await res.text();
    throw new Error(`Cart API ${path} failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchCart(): Promise<CartResponse> {
  return cartFetch<CartResponse>("/cart");
}

export async function addToCart(variantId: string, quantity = 1): Promise<CartResponse> {
  return cartFetch<CartResponse>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ variantId, quantity }),
  });
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartResponse> {
  return cartFetch<CartResponse>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId: string): Promise<CartResponse> {
  return cartFetch<CartResponse>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function checkout(
  shippingAddress: ShippingAddress,
  discountCode?: string,
): Promise<CheckoutResponse> {
  return cartFetch<CheckoutResponse>("/checkout", {
    method: "POST",
    body: JSON.stringify({ shippingAddress, discountCode: discountCode || undefined }),
  });
}

export async function validateDiscount(
  code: string,
  subtotalAmount: number,
): Promise<{ valid: boolean; discountAmount: number; message?: string; code?: string }> {
  const res = await fetch(`${API_URL}/discounts/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ code, subtotalAmount }),
  });
  return res.json() as Promise<{
    valid: boolean;
    discountAmount: number;
    message?: string;
    code?: string;
  }>;
}
