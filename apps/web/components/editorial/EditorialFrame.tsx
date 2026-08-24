"use client";

import { LuxuryImage } from "@/components/media";
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
  fit?: "cover" | "contain";
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
  fit = "cover",
  vignette = "none",
}: EditorialFrameProps) {
  const hasIntrinsicSize = Boolean(width && height);
  const aspectRatio = hasIntrinsicSize ? editorialAspectRatio(width!, height!) : undefined;

  return (
    <figure
      className={cn(
        "group relative min-w-0 overflow-hidden border border-champagne/15 bg-linen",
        className,
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div
        className={cn("relative h-full w-full min-h-0", imageClassName)}
        style={aspectRatio ? { aspectRatio } : { minHeight: "100%" }}
      >
        <LuxuryImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={!hasIntrinsicSize}
          fit={fit}
          priority={priority}
          sizes={sizes}
          className="h-full w-full"
          imageClassName="transition-transform duration-slow ease-luxury group-hover:scale-[1.03]"
        />
        {vignette === "soft" && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-ivory/5"
            aria-hidden
          />
        )}
        {vignette === "bottom" && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/45 to-transparent"
            aria-hidden
          />
        )}
      </div>
      {caption && (
        <figcaption className="px-1 py-3">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-olive">{caption}</p>
        </figcaption>
      )}
    </figure>
  );
}
