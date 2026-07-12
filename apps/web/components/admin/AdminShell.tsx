"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/reviews", label: "Reviews" },
] as const;

type AdminShellProps = {
  children: ReactNode;
  onLogout: () => void;
};

export function AdminShell({ children, onLogout }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#ebe2d0] text-charcoal">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gold/25 bg-maroon text-cream-light">
        <div className="border-b border-gold/20 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <AnimatedLogo size={32} className="text-gold-bright" />
            <div>
              <p className="font-display text-sm tracking-wide">Alankara</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
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
                  "block rounded-sm px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-gold/20 font-medium text-cream-light"
                    : "text-cream-light/75 hover:bg-gold/10 hover:text-cream-light",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gold/20 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-sm border border-gold/30 px-3 py-2 text-xs uppercase tracking-widest text-cream-light/80 transition-colors hover:bg-gold/10"
          >
            Sign out
          </button>
          <Link
            href="/"
            className="mt-2 block text-center text-[10px] uppercase tracking-widest text-gold/70 hover:text-gold"
          >
            View storefront
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-gold/20 bg-cream-light/80 px-6 py-4 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Operations console</p>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
