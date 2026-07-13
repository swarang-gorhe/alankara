"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthProvider } from "@/lib/auth/adapter";

function LoginForm() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") ?? "/account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const isSupabase = getAuthProvider() === "supabase";

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-display text-3xl text-maroon">Sign in</h1>
      <p className="mt-2 font-body text-sm text-ink-muted">
        Welcome back to Alankara.
      </p>

      {isSupabase && (
        <Button
          type="button"
          variant="outline"
          className="mt-8 w-full border-champagne/40"
          onClick={() => signInWithGoogle().catch((e) => setError(e.message))}
        >
          Continue with Google
        </Button>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="font-body text-sm text-ink">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="password" className="font-body text-sm text-ink">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        {!isSupabase && (
          <p className="font-body text-xs text-ink-muted">
            Dev mode: use password <code className="text-ink">customer-dev</code>
          </p>
        )}
        {error && <p className="font-body text-sm text-error">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="text-maroon underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
