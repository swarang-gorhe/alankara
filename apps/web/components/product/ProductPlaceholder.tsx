import Image from "next/image";
import { cn } from "@/lib/utils";
import { WovenTexture } from "@/components/ui/WovenTexture";

type ProductPlaceholderProps = {
  name: string;
  /** Swap for real product image in Phase 4+ */
  image?: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
};

const aspectClasses = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

export function ProductPlaceholder({
  name,
  image,
  className,
  aspectRatio = "square",
}: ProductPlaceholderProps) {
  if (image) {
    return (
      <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio], className)}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-cream via-cream-light to-[#e8d4b0]",
        aspectClasses[aspectRatio],
        className,
      )}
    >
      <WovenTexture opacity={0.12} />

      {/* Medallion watermark */}
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <Image
          src="/brand/logo.svg"
          alt=""
          width={120}
          height={120}
          className="opacity-[0.07]"
        />
      </div>

      {/* Serif product name */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <p className="text-center font-display text-lg leading-snug text-maroon/70 md:text-xl">
          {name}
        </p>
      </div>

      {/* Dev badge */}
      <span className="absolute bottom-3 right-3 rounded-sm border border-gold/40 bg-cream/80 px-2 py-0.5 font-body text-[10px] uppercase tracking-widest text-charcoal-muted backdrop-blur-sm">
        photo pending
      </span>
    </div>
  );
}
