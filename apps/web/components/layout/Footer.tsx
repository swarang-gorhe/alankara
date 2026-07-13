import Link from "next/link";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { SectionDivider } from "@/components/ui/SectionDivider";

const shopLinks = [
  { href: "/shop", label: "All pieces" },
  { href: "/shop?category=cloth-earrings", label: "Earrings" },
  { href: "/shop?category=fabric-necklaces", label: "Necklaces" },
  { href: "/shop?category=hair-accessories", label: "Hair" },
];

const storyLinks = [
  { href: "/our-story", label: "Our Story" },
  { href: "/artisans", label: "Artisans" },
  { href: "/reviews", label: "Reviews" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-champagne/20 bg-gradient-to-b from-ivory to-linen/40">
      <SectionDivider className="py-4" />

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr] md:gap-12">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <AnimatedLogo size={56} showTagline />
            <p className="max-w-xs text-center font-body text-sm leading-relaxed text-ink-muted md:text-left">
              Handmade cloth jewellery from artisan workshops — slow fashion, wearable art for
              everyday and celebration.
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-olive">Shop</p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer shop links">
              {shopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-ink-muted transition-colors hover:text-maroon"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-center md:text-left">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-olive">Discover</p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer discover links">
              {storyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-ink-muted transition-colors hover:text-maroon"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-champagne/15 pt-8 md:flex-row md:justify-between">
          <p className="font-body text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} Alankara. All rights reserved.
          </p>
          <p className="font-script text-sm italic text-champagne">
            Crafted with thread, worn with joy.
          </p>
        </div>
      </div>
    </footer>
  );
}
