"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { useScrollMorph } from "@/hooks/useScrollMorph";
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
    <Button
      variant="outline"
      size="sm"
      asChild
      className="relative border-champagne/25 bg-ivory/60 hover:border-champagne/50"
      data-magnetic
    >
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
        <span className="hidden sm:inline">Cart</span>
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-medium text-ivory">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}

type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const scrolled = useScrollMorph(32);

  const logoSize = scrolled ? 64 : 76;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-champagne/15 bg-ivory/95 shadow-[0_1px_0_rgba(201,147,47,0.08)] backdrop-blur-xl transition-all duration-base ease-luxury",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-base ease-luxury sm:px-6",
          scrolled ? "h-16" : "h-[4.75rem] md:h-20",
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 md:gap-4"
          aria-label="Alankara home"
          data-magnetic
        >
          <AnimatedLogo size={logoSize} idlePulse playEntrance={false} priority />
          <div className="hidden min-w-0 sm:block">
            <span className="font-display text-lg tracking-[0.12em] text-maroon md:text-xl">
              Alankara
            </span>
            <p className="truncate font-script text-xs italic text-warm-brown md:text-sm">
              Crafted for little moments.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-magnetic
              data-cursor-sparkle
              className={cn(
                "relative font-body text-[11px] uppercase tracking-[0.22em] transition-colors duration-base ease-luxury hover:text-maroon",
                pathname === link.href
                  ? "text-maroon after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-champagne"
                  : "text-ink-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden text-ink-muted sm:inline-flex" data-magnetic>
            <Link href="/account">Account</Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="sm:hidden" data-magnetic>
            <Link href="/account" aria-label="Account">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>
          </Button>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
