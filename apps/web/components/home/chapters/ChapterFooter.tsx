"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/artisans", label: "Artisans" },
  { href: "/reviews", label: "Reviews" },
];

export function ChapterFooter() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <footer className="relative border-t border-champagne/20 bg-ivory" aria-label="Site footer">
      <FabricTexture id="footer" opacity={0.04} />
      <SectionDivider className="py-4" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <AnimatedLogo size={72} idlePulse showTagline />
          </div>

          <nav className="flex flex-wrap justify-center gap-8" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-magnetic
                data-cursor-sparkle
                className={cn(
                  "relative font-body text-sm uppercase tracking-widest transition-colors duration-base ease-luxury",
                  hoveredLink === link.href ? "text-champagne" : "text-ink-muted",
                )}
                onMouseEnter={() => setHoveredLink(link.href)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-champagne transition-all duration-base ease-luxury",
                    hoveredLink === link.href ? "w-full" : "w-0",
                  )}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-12 text-center font-body text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Alankara. Handmade cloth jewellery — slow fashion,
          wearable art.
        </p>
      </div>
    </footer>
  );
}
