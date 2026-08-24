"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { consoleBase, toAdminPath } from "@/lib/admin/paths";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/ai", label: "AI Agents" },
] as const;

type AdminShellProps = {
  children: ReactNode;
  onLogout: () => void;
};

export function AdminShell({ children, onLogout }: AdminShellProps) {
  const pathname = usePathname();
  const base = consoleBase(pathname);
  const normalized = toAdminPath(pathname);

  return (
    <div className="flex min-h-screen bg-ivory text-ink">
      <aside className="flex w-60 shrink-0 flex-col border-r border-admin-sidebar-border bg-admin-sidebar text-admin-sidebar-text">
        <div className="border-b border-admin-sidebar-border px-5 py-6">
          <Link href={`${base}`} className="flex items-center gap-3">
            <AnimatedLogo size={28} className="text-admin-accent" />
            <div>
              <p className="font-display text-sm tracking-wide text-admin-sidebar-text">Atelier</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-admin-sidebar-muted">
                Console
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-5">
          {NAV_ITEMS.map((item) => {
            const href = item.href.replace(/^\/admin/, base);
            const active =
              "exact" in item && item.exact
                ? normalized === item.href
                : normalized.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "block rounded px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 font-medium text-admin-accent"
                    : "text-admin-sidebar-muted hover:bg-white/5 hover:text-admin-sidebar-text",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-admin-sidebar-border p-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded border border-admin-sidebar-border px-3 py-2 font-mono text-xs uppercase tracking-widest text-admin-sidebar-muted transition-colors hover:border-admin-accent/40 hover:text-admin-sidebar-text"
          >
            Sign out
          </button>
          <Link
            href="/"
            className="mt-2 block text-center text-[10px] uppercase tracking-widest text-admin-sidebar-muted hover:text-admin-accent"
          >
            View storefront
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-linen bg-ivory/80 px-8 py-4 backdrop-blur-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted">
            Atelier ledger · Textile jewellery
          </p>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
