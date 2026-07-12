"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { clearAdminToken, getAdminToken, isAdminAuthenticated } from "@/lib/admin/auth";

type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const authed = isAdminAuthenticated();
    if (!isLoginPage && !authed) {
      router.replace("/admin/login");
      return;
    }
    if (isLoginPage && authed) {
      router.replace("/admin");
      return;
    }
    setReady(true);
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

  if (!getAdminToken()) {
    return null;
  }

  return <AdminShell onLogout={handleLogout}>{children}</AdminShell>;
}
