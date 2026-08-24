import { FabricTexture } from "@/components/ui/FabricTexture";
import { MEDIA } from "@/lib/media";
import { cn } from "@/lib/utils";
import { LuxuryImage } from "./LuxuryImage";

type MaterialStillProps = {
  className?: string;
  caption?: string;
  variant?: "linen" | "silk" | "threads" | "pearls";
  showCaption?: boolean;
};

const VARIANTS = {
  linen: MEDIA.creamFolds,
  silk: MEDIA.silkCream,
  threads: MEDIA.threadWhite,
  pearls: MEDIA.pearls,
} as const;

/** Designed material field used when a product photograph is not studio-ready. */
export function MaterialStill({
  className,
  caption,
  variant = "linen",
  showCaption = false,
}: MaterialStillProps) {
  const asset = VARIANTS[variant];

  return (
    <figure className={cn("relative overflow-hidden bg-linen", className)}>
      <LuxuryImage
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        fit="cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        className="h-full w-full"
      />
      <FabricTexture id={`still-${variant}`} opacity={0.04} />
      {showCaption && (
        <figcaption className="absolute bottom-4 left-4 font-script text-lg italic text-ivory drop-shadow-sm">
          {caption ?? asset.caption}
        </figcaption>
      )}
    </figure>
  );
}
