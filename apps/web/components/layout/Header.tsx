"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/shop?collection=featured", label: "Collections" },
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

function CartLink() {
  const { cart } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <Button variant="ghost" size="icon" asChild className="relative text-ink-muted hover:text-maroon">
      <Link href="/cart" aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-0.5 text-[9px] font-medium text-ivory">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}

export function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [compact, setCompact] = useState(false);
  const accountHref = user ? "/account" : "/login";

  useEffect(() => {
    setMobileNavOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen && !searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen, searchOpen]);

  const matches = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const logoSize = compact ? 56 : 80;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-champagne/15 bg-ivory/85 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/75 transition-[height] duration-base ease-luxury",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6",
          compact ? "h-[3.75rem] md:h-16" : "h-[4.5rem] md:h-[5.25rem]",
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Alankara home">
          <AnimatedLogo size={logoSize} playEntrance={false} priority />
          <span className="hidden flex-col sm:flex">
            <span className="font-display text-base tracking-[0.18em] text-maroon md:text-lg">
              ALANKARA
            </span>
            <span className="hidden font-script text-sm italic text-warm-brown md:block">
              Crafted for little moments.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 xl:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={cn(
                "font-body text-[12px] tracking-[0.16em] transition-colors duration-base hover:text-maroon",
                pathname === link.href ? "text-maroon" : "text-ink-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="text-ink-muted"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden text-ink-muted sm:inline-flex">
            <Link href={accountHref}>{user ? "Account" : "Sign in"}</Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="sm:hidden text-ink-muted">
            <Link href={accountHref} aria-label={user ? "Account" : "Sign in"}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>
          </Button>
          <CartLink />
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-champagne/10 bg-ivory/95 xl:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}-m`}
                  href={link.href}
                  className="rounded-sm px-3 py-3 font-body text-sm tracking-[0.14em] text-ink-muted hover:bg-linen/60 hover:text-maroon"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[70] bg-ivory/95 px-4 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-label="Search"
          >
            <div className="mx-auto max-w-xl">
              <div className="flex items-center gap-3 border-b border-champagne/30 pb-3">
                <Search className="h-5 w-5 text-olive" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search cloth jewellery…"
                  className="flex-1 bg-transparent font-display text-2xl text-maroon outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(`/shop?q=${encodeURIComponent(query)}`);
                      setSearchOpen(false);
                    }
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                />
                <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                  <X className="h-5 w-5 text-maroon" />
                </button>
              </div>
              <ul className="mt-6 space-y-3">
                {matches.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block font-display text-xl text-maroon hover:text-warm-brown"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
