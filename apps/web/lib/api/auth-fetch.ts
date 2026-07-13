import { getAccessToken } from "@/lib/auth/adapter";
import { API_URL } from "@/lib/api/client";

export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("API is not configured");

  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
