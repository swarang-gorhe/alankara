import { authFetch } from "@/lib/api/auth-fetch";

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
};

export type CustomerOrder = {
  id: string;
  status: string;
  total: { amount: number; currency: string };
  items: OrderItem[];
  createdAt: string;
};

export type Address = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
};

export async function fetchMyOrders(): Promise<CustomerOrder[]> {
  return authFetch<CustomerOrder[]>("/orders");
}

export async function fetchAddresses(): Promise<Address[]> {
  return authFetch<Address[]>("/addresses");
}

export async function createAddress(
  data: Omit<Address, "id" | "createdAt">,
): Promise<Address> {
  return authFetch<Address>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  await authFetch<void>(`/addresses/${id}`, { method: "DELETE" });
}

export async function fetchProfile(): Promise<{ id: string; email: string; role: string }> {
  return authFetch("/auth/me");
}
