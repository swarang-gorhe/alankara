import { ProductStill } from "@/components/media";
import { cn } from "@/lib/utils";

type ProductPlaceholderProps = {
  name: string;
  image?: string;
  slug?: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
  priority?: boolean;
  sizes?: string;
};

/**
 * Product frame — jewellery sits contained on ivory linen.
 * Never shows "photo pending". Never stretches the piece.
 */
export function ProductPlaceholder({
  name,
  image,
  slug,
  className,
  aspectRatio = "square",
  priority = false,
  sizes,
}: ProductPlaceholderProps) {
  const aspect =
    aspectRatio === "portrait" ? "portrait" : aspectRatio === "landscape" ? "landscape" : "square";

  return (
    <ProductStill
      name={name}
      slug={slug}
      image={image}
      aspect={aspect}
      priority={priority}
      sizes={sizes}
      hoverZoom
      className={cn(className)}
    />
  );
}
