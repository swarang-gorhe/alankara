"use client";

import { useState } from "react";
import { AnimatedLogo, LOGO_SHOWCASE_SIZE } from "@/components/brand/AnimatedLogo";
import {
  DarkLuxuryTexture,
  DustyRoseDivider,
  GoldDivider,
  PromotionalBanner,
  WaxSeal,
} from "@/components/decor";
import { Chip } from "@/components/ui/chip";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { Input } from "@/components/ui/input";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const palette = [
  { name: "Ivory", token: "ivory", hex: "#FAF3E7" },
  { name: "Linen", token: "linen", hex: "#F3E4CD" },
  { name: "Champagne Gold", token: "champagne", hex: "#C9932F" },
  { name: "Muted Maroon", token: "maroon", hex: "#6F2317" },
  { name: "Olive", token: "olive", hex: "#6B7353" },
  { name: "Warm Brown", token: "warm-brown", hex: "#7A2E1C" },
  { name: "Sage", token: "sage", hex: "#A8AD96" },
  { name: "Cotton", token: "cotton", hex: "#EFE7D8" },
  { name: "Ink", token: "ink", hex: "#2B231C" },
  { name: "Deep Wine", token: "deep-wine", hex: "#3D1520" },
  { name: "Aged Burgundy", token: "aged-burgundy", hex: "#4A1A24" },
  { name: "Antique Gold", token: "antique-gold", hex: "#C9A227" },
  { name: "Dusty Rose", token: "dusty-rose", hex: "#B98277" },
  { name: "Kraft Cream", token: "kraft-cream", hex: "#EDE1CE" },
  { name: "Success", token: "success", hex: "#6B7353" },
  { name: "Error", token: "error", hex: "#7A2E1C" },
] as const;

const typeScale = [
  { label: "Display", className: "font-display text-display text-maroon" },
  { label: "4XL", className: "font-display text-4xl text-maroon" },
  { label: "3XL", className: "font-display text-3xl text-maroon" },
  { label: "2XL", className: "font-display text-2xl text-maroon" },
  { label: "XL", className: "font-body text-xl text-ink" },
  { label: "LG", className: "font-body text-lg text-ink" },
  { label: "Base", className: "font-body text-base text-ink" },
  { label: "SM", className: "font-body text-sm text-ink-muted" },
  { label: "XS", className: "font-body text-xs text-ink-muted" },
  { label: "Script accent", className: "font-script text-2xl text-warm-brown" },
] as const;

const filterChips = ["All", "Earrings", "Necklaces", "Hair pins", "Brooches", "Sets"];

function ShowcaseSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-maroon">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [activeChip, setActiveChip] = useState("All");

  return (
    <div className="relative">
      <FabricTexture id="ds-page" className="fixed inset-0" opacity={0.05} />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <header className="mb-16 space-y-4">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-olive">Phase 1</p>
          <h1 className="font-display text-display text-maroon">Alankara Design System</h1>
          <p className="max-w-2xl font-body text-lg text-ink-muted">
            Cloth and fabric jewellery tokens, typography, motion, texture, and base components.
            Review here before Phase 2 page builds.
          </p>
        </header>

        <div className="space-y-20">
          <ShowcaseSection title="Color palette" description="Named Tailwind tokens — no scattered hex in components.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {palette.map((swatch) => (
                <div
                  key={swatch.token}
                  className="paper-card overflow-hidden rounded-sm border border-sage/30"
                >
                  <div className="h-20" style={{ backgroundColor: swatch.hex }} />
                  <div className="space-y-1 p-4">
                    <p className="font-display text-sm text-maroon">{swatch.name}</p>
                    <p className="font-body text-xs text-ink-muted">
                      <code className="text-ink">{swatch.token}</code> · {swatch.hex}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ShowcaseSection>

          <SectionDivider />

          <ShowcaseSection title="Typography" description="Playfair Display, Cormorant Garamond Italic (taglines), Source Sans 3 body.">
            <div className="paper-card space-y-6 rounded-sm border border-sage/30 p-8">
              {typeScale.map((row) => (
                <div key={row.label} className="flex flex-col gap-1 border-b border-sage/20 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-8">
                  <span className="w-28 shrink-0 font-body text-xs uppercase tracking-widest text-olive">
                    {row.label}
                  </span>
                  <p className={row.className}>
                    {row.label === "Script accent"
                      ? "Woven threads, quiet elegance."
                      : "Handcrafted fabric adornments"}
                  </p>
                </div>
              ))}
            </div>
          </ShowcaseSection>

          <SectionDivider />

          <ShowcaseSection title="Buttons" description="Luxury easing, idle breathing motion, magnetic-ready structure.">
            <div className="flex flex-wrap gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Inputs">
            <div className="grid max-w-xl gap-6">
              <div className="space-y-2">
                <label htmlFor="ds-name" className="font-body text-sm text-ink">
                  Name
                </label>
                <Input id="ds-name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="ds-email" className="font-body text-sm text-ink">
                  Email (error state)
                </label>
                <Input id="ds-email" placeholder="you@example.com" error defaultValue="invalid" />
              </div>
              <div className="space-y-2">
                <label htmlFor="ds-note" className="font-body text-sm text-ink">
                  Note
                </label>
                <Textarea id="ds-note" placeholder="A message about your fabric piece…" />
              </div>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Chips" description="Filter pill primitive for future shop filters.">
            <div className="flex flex-wrap gap-2">
              {filterChips.map((chip) => (
                <Chip
                  key={chip}
                  variant={activeChip === chip ? "active" : "default"}
                  onClick={() => setActiveChip(chip)}
                  aria-pressed={activeChip === chip}
                >
                  {chip}
                </Chip>
              ))}
            </div>
          </ShowcaseSection>

          <SectionDivider />

          <ShowcaseSection title="Motion tokens" description="ease-luxury · duration-fast (200ms) · duration-base (500ms) · duration-slow (900ms)">
            <div className="paper-card grid gap-8 rounded-sm border border-sage/30 p-8 md:grid-cols-3">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-olive">Fast · 200ms</p>
                <div className="h-2 w-full rounded-full bg-cotton">
                  <div className="h-2 w-1/3 rounded-full bg-champagne transition-all duration-fast ease-luxury hover:w-full" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-olive">Base · 500ms</p>
                <div className="h-2 w-full rounded-full bg-cotton">
                  <div className="h-2 w-1/3 rounded-full bg-olive transition-all duration-base ease-luxury hover:w-full" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-olive">Slow · 900ms</p>
                <div className="motion-safe:animate-motion-demo h-3 w-3 rounded-full bg-maroon" />
              </div>
            </div>
            <p className="font-body text-sm text-ink-muted">
              CSS variables: <code className="text-ink">--ease-luxury</code>,{" "}
              <code className="text-ink">--duration-fast</code>,{" "}
              <code className="text-ink">--duration-base</code>,{" "}
              <code className="text-ink">--duration-slow</code>
            </p>
          </ShowcaseSection>

          <ShowcaseSection title="Fabric texture">
            <div className="relative h-48 overflow-hidden rounded-sm border border-sage/30 bg-ivory">
              <FabricTexture id="ds-texture-demo" opacity={0.12} />
              <div className="relative flex h-full items-center justify-center">
                <p className="font-display text-xl text-maroon">Texture overlay</p>
              </div>
            </div>
          </ShowcaseSection>

          <SectionDivider />

          <ShowcaseSection
            title="Dark luxury register"
            description="Deep-wine backgrounds with antique-gold type — for hero variants, packaging chapters, and promotional moments. Does not replace the primary ivory/linen palette."
          >
            <div className="relative overflow-hidden rounded-sm border border-antique-gold/20 bg-deep-wine px-8 py-12">
              <DarkLuxuryTexture />
              <div className="relative z-10 space-y-6">
                <p className="font-body text-xs uppercase tracking-[0.3em] text-antique-gold/80">
                  Packaging chapter
                </p>
                <h3 className="font-display text-3xl text-antique-gold">The details matter</h3>
                <GoldDivider width="sm" tone="antique" />
                <DustyRoseDivider width="sm" />
                <div className="flex flex-wrap items-center gap-6">
                  <WaxSeal size={56} />
                  <div className="rounded-sm border border-antique-gold/25 bg-kraft-cream px-6 py-4">
                    <p className="font-display text-sm text-deep-wine">Kraft-cream gift pouch</p>
                    <p className="mt-1 font-body text-xs text-ink-muted">Embossed seal · tissue wrap</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <PromotionalBanner
                title="Festival thread collection"
                subtitle="Mirror work, brocade thread, and hand-stitched zari — limited small batches."
                href="/shop"
              />
            </div>
          </ShowcaseSection>

          <SectionDivider />

          <ShowcaseSection
            title="Animated logo"
            description={`Showcase size ${LOGO_SHOWCASE_SIZE}px (~250% of 40px header). Entrance spin, petal bloom, glow, scroll float, idle pulse, hover spread.`}
          >
            <div className="paper-card flex flex-col items-center rounded-sm border border-sage/30 px-8 py-16">
              <AnimatedLogo size={LOGO_SHOWCASE_SIZE} showTagline playEntrance idlePulse />
              <p className="mt-8 text-center font-body text-xs text-ink-muted">
                Scroll the page to see subtle float · hover for petal spread · idle rotate every ~20s
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4 rounded-sm border border-dashed border-sage/40 bg-cotton/50 p-6">
              <AnimatedLogo size={40} idlePulse playEntrance={false} />
              <p className="font-body text-sm text-ink-muted">Header scale (40px) — idle pulse only</p>
            </div>
          </ShowcaseSection>

          <ShowcaseSection title="Status colors">
            <div className="flex flex-wrap gap-4">
              <div className="rounded-sm border border-success-muted/50 bg-success-muted/20 px-4 py-3 text-sm text-success">
                Order confirmed — fabric piece reserved
              </div>
              <div className="rounded-sm border border-error-muted/50 bg-error-muted/15 px-4 py-3 text-sm text-error">
                Please check your delivery address
              </div>
            </div>
          </ShowcaseSection>
        </div>

        <footer className="mt-20 border-t border-sage/30 pt-8 text-center font-body text-xs text-ink-muted">
          Phase 1 complete · Homepage and shop pages intentionally not rebuilt
        </footer>
      </div>
    </div>
  );
}
