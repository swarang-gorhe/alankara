import { getProductMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import { LuxuryImage } from "./LuxuryImage";

type ProductStillProps = {
  name: string;
  slug?: string;
  image?: string;
  className?: string;
  /** Display crop — jewellery is never stretched. */
  aspect?: "square" | "portrait" | "landscape" | "auto";
  priority?: boolean;
  sizes?: string;
  hoverZoom?: boolean;
};

const aspectClass = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  auto: "",
};

/**
 * Product photography on ivory linen.
 * object-fit: contain so hooks, drops, and silhouettes are never cropped.
 */
export function ProductStill({
  name,
  slug,
  image,
  className,
  aspect = "square",
  priority = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
  hoverZoom = false,
}: ProductStillProps) {
  const media = slug ? getProductMedia(slug, image ? [image] : []) : null;
  const src = image ?? media?.main;

  return (
    <div
      className={cn(
        "product-still relative overflow-hidden bg-gradient-to-b from-ivory via-[#f7efe2] to-linen",
        aspectClass[aspect],
        className,
      )}
    >
      <div className="linen-grain pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      {src ? (
        <LuxuryImage
          src={src}
          alt={name}
          fill
          fit="contain"
          priority={priority}
          sizes={sizes}
          className="absolute inset-0 bg-transparent"
          imageClassName={cn(
            "p-[8%] md:p-[10%]",
            hoverZoom &&
              "transition-transform duration-[900ms] ease-luxury group-hover:scale-[1.04]",
          )}
        />
      ) : (
        <LuxuryImage
          src="/media/materials/cream-folds.jpg"
          alt=""
          fill
          fit="cover"
          sizes={sizes}
          className="absolute inset-0"
          imageClassName="opacity-80"
        />
      )}
    </div>
  );
}
