import { API_URL } from "@/lib/api/client";
import { clearAdminToken, getAdminToken } from "@/lib/admin/auth";

const ADMIN_API_BASE = "/api/admin";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type DashboardStats = {
  revenue: { amount: number; currency: string };
  ordersCount: number;
  pendingOrdersCount: number;
  productsCount: number;
  customersCount: number;
  reviewsCount: number;
  pendingReviewsCount: number;
  activeCouponsCount: number;
  lowStockAlerts: Array<{
    variantId: string;
    sku: string;
    productId: string;
    productName: string;
    stock: number;
  }>;
  recentActivity?: Array<{
    type: string;
    id: string;
    label: string;
    email: string;
    amount: number;
    createdAt: string;
  }>;
  revenueByMonth?: Array<{ month: string; amount: number }>;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  categorySlug: string;
  primaryMaterial: string;
  minPrice: number;
  featured: boolean;
  images?: string[];
  variants: Array<{
    id: string;
    sku: string;
    size?: string;
    color?: string;
    material?: string;
    price: { amount: number; currency: string };
    stock: number;
  }>;
};

export type AdminDiscount = {
  id: string;
  code: string;
  type: string;
  value: number;
  conditions?: {
    minOrderAmount?: number;
    categorySlugs?: string[];
    productIds?: string[];
  };
  expiresAt?: string;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
};

export type AdminOrder = {
  id: string;
  status: string;
  email: string;
  phone?: string;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  subtotal: { amount: number; currency: string };
  discountCode?: string;
  discountAmount: { amount: number; currency: string };
  total: { amount: number; currency: string };
  fulfillmentNotes?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantLabel?: string;
    quantity: number;
    lineTotal: { amount: number; currency: string };
  }>;
};

export type AdminFaq = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  published: boolean;
};

export type AdminReview = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  authorName: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
};

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const adminPath = path.startsWith("/admin") ? path.slice("/admin".length) : path;
  const res = await fetch(`${ADMIN_API_BASE}${adminPath}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new AdminApiError("Session expired", 401);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new AdminApiError(`Admin API ${path} failed (${res.status}): ${body}`, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new AdminApiError("Invalid credentials", res.status);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return adminFetch<DashboardStats>("/admin/dashboard/stats");
}

export async function fetchAdminProducts(
  page = 1,
  search?: string,
): Promise<Paginated<AdminProduct>> {
  const params = new URLSearchParams({ page: String(page), page_size: "50" });
  if (search) params.set("q", search);
  return adminFetch<Paginated<AdminProduct>>(`/admin/products?${params.toString()}`);
}

export async function fetchAdminProduct(id: string): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${id}`);
}

export async function fetchCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  const data = await adminFetch<Paginated<{ id: string; name: string; slug: string }>>(
    "/admin/categories?page_size=100",
  );
  return data.items;
}

export async function uploadAdminImage(file: File): Promise<{ url: string; key: string }> {
  const token = getAdminToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/media/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new AdminApiError(`Upload failed (${res.status}): ${body}`, res.status);
  }
  return res.json() as Promise<{ url: string; key: string }>;
}

export async function createAdminVariant(
  productId: string,
  body: Record<string, unknown>,
): Promise<void> {
  await adminFetch(`/admin/products/${productId}/variants`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminVariant(
  productId: string,
  variantId: string,
  body: Record<string, unknown>,
): Promise<void> {
  await adminFetch(`/admin/products/${productId}/variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminVariant(productId: string, variantId: string): Promise<void> {
  await adminFetch<void>(`/admin/products/${productId}/variants/${variantId}`, {
    method: "DELETE",
  });
}

export async function updateVariantStock(
  productId: string,
  variantId: string,
  stock: number,
): Promise<void> {
  await updateAdminVariant(productId, variantId, { stock });
}

export async function fetchAdminCustomers(): Promise<
  Array<{ email: string; orderCount: number; totalSpent: number; lastOrderAt: string | null }>
> {
  return adminFetch("/admin/customers");
}

export async function fetchAdminCategoriesAdmin(): Promise<
  Paginated<{ id: string; slug: string; name: string; description?: string }>
> {
  return adminFetch("/admin/categories?page_size=100");
}

export async function createAdminCategory(body: Record<string, unknown>) {
  return adminFetch("/admin/categories", { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminCategory(id: string, body: Record<string, unknown>) {
  return adminFetch(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminCategory(id: string) {
  await adminFetch<void>(`/admin/categories/${id}`, { method: "DELETE" });
}

export async function fetchAdminCollections() {
  return adminFetch<Paginated<Record<string, unknown>>>("/admin/collections?page_size=50");
}

export async function createAdminCollection(body: Record<string, unknown>) {
  return adminFetch("/admin/collections", { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminCollection(id: string, body: Record<string, unknown>) {
  return adminFetch(`/admin/collections/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminCollection(id: string) {
  await adminFetch<void>(`/admin/collections/${id}`, { method: "DELETE" });
}

export async function fetchAdminOrders(status?: string): Promise<Paginated<AdminOrder>> {
  const params = new URLSearchParams({ page_size: "50" });
  if (status) params.set("status", status);
  return adminFetch<Paginated<AdminOrder>>(`/admin/orders?${params.toString()}`);
}

export async function createAdminProduct(body: Record<string, unknown>): Promise<AdminProduct> {
  return adminFetch<AdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminProduct(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await adminFetch<void>(`/admin/products/${id}`, { method: "DELETE" });
}

export async function fetchAdminDiscounts(): Promise<Paginated<AdminDiscount>> {
  return adminFetch<Paginated<AdminDiscount>>("/admin/discounts?page_size=50");
}

export async function createAdminDiscount(body: Record<string, unknown>): Promise<AdminDiscount> {
  return adminFetch<AdminDiscount>("/admin/discounts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminDiscount(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminDiscount> {
  return adminFetch<AdminDiscount>(`/admin/discounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminDiscount(id: string): Promise<void> {
  await adminFetch<void>(`/admin/discounts/${id}`, { method: "DELETE" });
}

export async function updateAdminOrder(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function fetchAdminFaq(): Promise<Paginated<AdminFaq>> {
  return adminFetch<Paginated<AdminFaq>>("/admin/faq?page_size=100");
}

export async function createAdminFaq(body: Record<string, unknown>): Promise<AdminFaq> {
  return adminFetch<AdminFaq>("/admin/faq", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminFaq(id: string, body: Record<string, unknown>): Promise<AdminFaq> {
  return adminFetch<AdminFaq>(`/admin/faq/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminFaq(id: string): Promise<void> {
  await adminFetch<void>(`/admin/faq/${id}`, { method: "DELETE" });
}

export async function fetchAdminReviews(approved?: boolean): Promise<Paginated<AdminReview>> {
  const params = new URLSearchParams({ page_size: "50" });
  if (approved !== undefined) {
    params.set("approved", String(approved));
  }
  return adminFetch<Paginated<AdminReview>>(`/admin/reviews?${params.toString()}`);
}

export async function moderateReview(id: string, approved: boolean): Promise<AdminReview> {
  return adminFetch<AdminReview>(`/admin/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ approved }),
  });
}

export async function validateDiscountCode(
  code: string,
): Promise<{ valid: boolean; discountAmount: number; message?: string }> {
  const res = await fetch(`${API_URL}/discounts/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  return res.json() as Promise<{ valid: boolean; discountAmount: number; message?: string }>;
}
