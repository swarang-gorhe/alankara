"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/ai", label: "AI Agents" },
] as const;

type AdminShellProps = {
  children: ReactNode;
  onLogout: () => void;
};

export function AdminShell({ children, onLogout }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text">
      <aside className="flex w-60 shrink-0 flex-col border-r border-admin-border bg-admin-surface">
        <div className="border-b border-admin-border px-5 py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <AnimatedLogo size={28} className="text-admin-accent" />
            <div>
              <p className="font-display text-sm tracking-wide text-admin-text">Alankara</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-admin-muted">Console</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-5">
          {NAV_ITEMS.map((item) => {
            const active =
              "exact" in item && item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-admin-elevated font-medium text-admin-accent"
                    : "text-admin-muted hover:bg-admin-elevated/60 hover:text-admin-text",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-admin-border p-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded border border-admin-border px-3 py-2 text-xs uppercase tracking-widest text-admin-muted transition-colors hover:border-admin-accent/40 hover:text-admin-text"
          >
            Sign out
          </button>
          <Link
            href="/"
            className="mt-2 block text-center text-[10px] uppercase tracking-widest text-admin-muted hover:text-admin-accent"
          >
            View storefront
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-admin-border bg-admin-surface/80 px-8 py-4 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.3em] text-admin-muted">
            Operations · Textile Jewellery
          </p>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
