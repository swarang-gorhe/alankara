import Link from "next/link";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { SectionDivider } from "@/components/ui/SectionDivider";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/artisans", label: "Artisans" },
  { href: "/reviews", label: "Reviews" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-champagne/20 bg-ivory">
      <SectionDivider className="py-4" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <AnimatedLogo size={56} showTagline />
          </div>

          <nav className="flex flex-wrap justify-center gap-6" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm uppercase tracking-widest text-ink-muted transition-colors hover:text-champagne"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-10 text-center font-body text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Alankara. Handmade cloth jewellery — slow fashion,
          wearable art.
        </p>
      </div>
    </footer>
  );
}
