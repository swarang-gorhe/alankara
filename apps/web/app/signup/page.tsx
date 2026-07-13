"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthProvider } from "@/lib/auth/adapter";

export default function SignupPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSupabase = getAuthProvider() === "supabase";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-3xl text-maroon">Create account</h1>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Join Alankara for orders, wishlists, and saved addresses.
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
            />
          </div>
          {!isSupabase && (
            <p className="font-body text-xs text-ink-muted">
              Dev mode: any email with password <code className="text-ink">customer-dev</code>
            </p>
          )}
          {error && <p className="font-body text-sm text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-maroon underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
