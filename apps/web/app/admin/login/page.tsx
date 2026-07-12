"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { Button } from "@/components/ui/button";
import { setAdminToken } from "@/lib/admin/auth";
import { adminLogin } from "@/lib/api/admin";

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
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ebe2d0] px-6">
      <div className="w-full max-w-md rounded-sm border border-gold/30 bg-cream-light p-8 paper-card">
        <div className="flex flex-col items-center text-center">
          <AnimatedLogo size={48} className="text-gold-bright" />
          <h1 className="mt-4 font-display text-2xl text-maroon">Admin sign in</h1>
          <p className="mt-2 text-sm text-charcoal-muted">
            Alankara operations console
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-4 py-3 text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-4 py-3 text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </label>

          {error && (
            <p className="rounded-sm border border-maroon/30 px-4 py-3 text-sm text-maroon">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
