import { getAdminToken } from "@/lib/admin/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthProvider = "jwt" | "supabase";

/**
 * Which auth backend is active. Defaults to JWT dev auth until Supabase is configured
 * and NEXT_PUBLIC_AUTH_PROVIDER=supabase is set on Vercel.
 */
export function getAuthProvider(): AuthProvider {
  if (process.env.NEXT_PUBLIC_AUTH_PROVIDER === "supabase") {
    return "supabase";
  }
  return "jwt";
}

/**
 * Returns a bearer token for API requests, or null if unauthenticated.
 * Bridges JWT localStorage (dev) and Supabase session (production).
 */
export async function getAccessToken(): Promise<string | null> {
  if (getAuthProvider() === "supabase") {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
  return getAdminToken();
}

/**
 * Whether the current provider has credentials configured.
 */
export function isAuthConfigured(): boolean {
  if (getAuthProvider() === "supabase") {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return true;
}
