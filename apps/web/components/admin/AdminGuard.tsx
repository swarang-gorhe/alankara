"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin/auth";

type AdminGuardProps = {
  children: ReactNode;
};

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const user = (await res.json()) as { role?: string };
    return user.role === "admin";
  } catch {
    return false;
  }
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const token = getAdminToken();

      if (!token) {
        if (!isLoginPage) {
          router.replace("/admin/login");
          return;
        }
        if (!cancelled) {
          setAuthorized(false);
          setReady(true);
        }
        return;
      }

      const isAdmin = await verifyAdminToken(token);
      if (cancelled) return;

      if (!isAdmin) {
        clearAdminToken();
        if (!isLoginPage) {
          router.replace("/admin/login");
          return;
        }
        setAuthorized(false);
        setReady(true);
        return;
      }

      if (isLoginPage) {
        router.replace("/admin");
        return;
      }

      setAuthorized(true);
      setReady(true);
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, router, pathname]);

  const handleLogout = () => {
    clearAdminToken();
    router.replace("/admin/login");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg text-admin-muted">
        Loading…
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authorized || !getAdminToken()) {
    return null;
  }

  return <AdminShell onLogout={handleLogout}>{children}</AdminShell>;
}

/** Store token only after role verification (used by login page). */
export async function loginAsAdmin(email: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Invalid credentials");
  }
  const data = (await res.json()) as { access_token: string };
  const isAdmin = await verifyAdminToken(data.access_token);
  if (!isAdmin) {
    throw new Error("This account does not have admin access.");
  }
  setAdminToken(data.access_token);
}
