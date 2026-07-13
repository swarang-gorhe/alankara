"use client";

import Image from "next/image";
import { editorialAspectRatio } from "@/lib/editorial/story-images";
import { cn } from "@/lib/utils";

type EditorialFrameProps = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
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
  width,
  height,
  vignette = "soft",
}: EditorialFrameProps) {
  const hasIntrinsicSize = Boolean(width && height);
  const aspectRatio = hasIntrinsicSize ? editorialAspectRatio(width!, height!) : undefined;

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-sm border border-champagne/20 bg-linen shadow-[0_12px_40px_rgba(43,35,28,0.08)]",
        className,
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div className={cn("relative w-full", imageClassName)} style={aspectRatio ? { aspectRatio } : undefined}>
        {hasIntrinsicSize ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-slow ease-luxury group-hover:scale-[1.02]"
            sizes={sizes}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-slow ease-luxury group-hover:scale-[1.03]"
            sizes={sizes}
          />
        )}
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
