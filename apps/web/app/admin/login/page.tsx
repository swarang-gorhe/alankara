"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { adminLogin } from "@/lib/api/admin";
import { setAdminToken } from "@/lib/admin/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@alankara.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await adminLogin(email, password);
      setAdminToken(token);
      router.replace("/admin");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-md rounded-lg border border-admin-border bg-admin-surface p-8">
        <div className="flex flex-col items-center text-center">
          <AnimatedLogo size={48} className="text-admin-accent" />
          <h1 className="mt-4 font-display text-2xl text-admin-text">Alankara Console</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-admin-muted">
            Admin access only
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-4 py-3 text-admin-text focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-4 py-3 text-admin-text focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
            />
          </label>
          {error && <p className="text-sm text-admin-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-admin-accent px-4 py-3 text-sm uppercase tracking-widest text-admin-bg transition-colors hover:bg-admin-accent-dim disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
