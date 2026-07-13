"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type EditorialFrameProps = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** Warm vignette for text legibility */
  vignette?: "none" | "soft" | "bottom";
};

export function EditorialFrame({
  src,
  alt,
  caption,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  vignette = "soft",
}: EditorialFrameProps) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-sm border border-champagne/20 bg-linen shadow-[0_12px_40px_rgba(43,35,28,0.08)]",
        className,
      )}
    >
      <div className={cn("relative h-full w-full", imageClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover transition-transform duration-slow ease-luxury group-hover:scale-[1.03]"
          sizes={sizes}
        />
        {vignette === "soft" && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-ivory/10"
            aria-hidden="true"
          />
        )}
        {vignette === "bottom" && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/50 to-transparent"
            aria-hidden="true"
          />
        )}
      </div>
      {caption && (
        <figcaption className="absolute bottom-0 left-0 right-0 px-4 py-3 md:px-5 md:py-4">
          <p className="font-display text-sm text-ivory drop-shadow-sm md:text-base">{caption}</p>
        </figcaption>
      )}
    </figure>
  );
}
