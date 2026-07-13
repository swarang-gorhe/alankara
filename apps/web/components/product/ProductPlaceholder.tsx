import Image from "next/image";
import { cn } from "@/lib/utils";
import { SpoolIcon } from "@/components/decor/CraftPillarIcons";
import { FabricTexture } from "@/components/ui/FabricTexture";

type ProductPlaceholderProps = {
  name: string;
  image?: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
  priority?: boolean;
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
  priority = false,
}: ProductPlaceholderProps) {
  if (image) {
    return (
      <div className={cn("relative overflow-hidden bg-ivory", aspectClasses[aspectRatio], className)}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-linen via-ivory to-cotton",
        aspectClasses[aspectRatio],
        className,
      )}
    >
      <FabricTexture id={`ph-${name.slice(0, 8)}`} opacity={0.08} />

      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <SpoolIcon size={64} className="opacity-20" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <p className="text-center font-display text-lg leading-snug text-maroon/70 md:text-xl">
          {name}
        </p>
      </div>

      <span className="absolute bottom-3 right-3 rounded-sm border border-champagne/40 bg-ivory/80 px-2 py-0.5 font-body text-[10px] uppercase tracking-widest text-ink-muted backdrop-blur-sm">
        photo pending
      </span>
    </div>
  );
}
