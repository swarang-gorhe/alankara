import Link from "next/link";
import { DarkLuxuryTexture } from "@/components/decor/DarkLuxuryTexture";
import { cn } from "@/lib/utils";

type PromotionalBannerProps = {
  className?: string;
  href?: string;
  title?: string;
  subtitle?: string;
};

/** Deep-wine + antique-gold promotional strip — festival / limited drops */
export function PromotionalBanner({
  className,
  href = "/shop?category=embroidered-textile-jewellery",
  title = "Festive Textiles",
  subtitle = "Mirror work, brocade thread, and hand-stitched zari — limited small batches.",
}: PromotionalBannerProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-sm border border-antique-gold/25",
        "bg-gradient-to-r from-deep-wine via-aged-burgundy to-deep-wine",
        "px-6 py-8 transition-shadow duration-base ease-luxury hover:shadow-luxury-lg md:px-10 md:py-10",
        className,
      )}
    >
      <DarkLuxuryTexture vignette />
      <div className="relative z-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-body text-[10px] uppercase tracking-[0.35em] text-antique-gold/80">
            Limited collection
          </p>
          <h2 className="mt-2 font-display text-2xl text-antique-gold md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-xl font-body text-sm text-ivory/75">{subtitle}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-dusty-rose transition-colors group-hover:text-antique-gold md:mt-0">
          Explore the edit
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
