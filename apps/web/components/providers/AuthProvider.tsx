"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearCustomerSession,
  getCustomerUser,
  setCustomerSession,
  type CustomerUser,
} from "@/lib/auth/customer";
import { getAuthProvider } from "@/lib/auth/adapter";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: CustomerUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function devJwtLogin(email: string, password: string): Promise<CustomerUser> {
  let res: Response;
  try {
    res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      "Could not reach the server. If using dev auth, ensure the API is running and NEXT_PUBLIC_API_URL is set on Vercel.",
    );
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Login failed");
  }
  const data = (await res.json()) as { access_token: string };
  let meRes: Response;
  try {
    meRes = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
  } catch {
    throw new Error("Could not load profile — API unreachable.");
  }
  if (!meRes.ok) throw new Error("Could not load profile");
  const me = (await meRes.json()) as CustomerUser;
  setCustomerSession(data.access_token, me);
  return me;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const provider = getAuthProvider();
    if (provider === "supabase") {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setUser(null);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setUser(null);
        return;
      }
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        role: (session.user.app_metadata?.role as string) ?? "customer",
      });
      return;
    }
    setUser(getCustomerUser());
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
    const provider = getAuthProvider();
    if (provider === "supabase") {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { data: sub } = supabase.auth.onAuthStateChange(() => {
        refreshSession();
      });
      return () => sub.subscription.unsubscribe();
    }
  }, [refreshSession]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const provider = getAuthProvider();
    if (provider === "supabase") {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase is not configured");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await refreshSession();
      return;
    }
    const me = await devJwtLogin(email, password);
    setUser(me);
  }, [refreshSession]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const provider = getAuthProvider();
    if (provider === "supabase") {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) {
        throw new Error("Check your email to confirm your account, then sign in.");
      }
      await refreshSession();
      return;
    }
    const me = await devJwtLogin(email, password);
    setUser(me);
  }, [refreshSession]);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Google sign-in requires Supabase configuration");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const provider = getAuthProvider();
    if (provider === "supabase") {
      const supabase = getSupabaseBrowserClient();
      await supabase?.auth.signOut();
    }
    clearCustomerSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
