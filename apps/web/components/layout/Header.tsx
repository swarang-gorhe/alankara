"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/artisans", label: "Artisans" },
  { href: "/reviews", label: "Reviews" },
];

function CartLink() {
  const { cart } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <Button variant="outline" size="sm" asChild className="relative">
      <Link href="/cart" aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mr-1.5 h-4 w-4"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        Cart
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-medium text-cream-light">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Alankara home">
          <AnimatedLogo size={40} idlePulse />
          <span className="font-display text-xl tracking-wide text-maroon">Alankara</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm uppercase tracking-widest transition-colors hover:text-gold",
                pathname === link.href ? "text-gold-bright" : "text-charcoal-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">Account</Link>
          </Button>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
