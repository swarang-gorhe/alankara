"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FitMode } from "@/lib/media";
import { ImageSkeleton } from "./ImageSkeleton";

type LuxuryImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  fit?: FitMode;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  /** Only use cover on large lifestyle/hero assets — never on product jewellery. */
  onLoad?: () => void;
};

export function LuxuryImage({
  src,
  alt,
  width,
  height,
  fill = false,
  fit = "cover",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
  imageClassName,
  onLoad,
}: LuxuryImageProps) {
  const [loaded, setLoaded] = useState(false);
  const useFill = fill || !(width && height);

  return (
    <div className={cn("relative overflow-hidden bg-linen", className)}>
      {!loaded && <ImageSkeleton />}
      {useFill ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes}
          className={cn(
            "transition-opacity duration-700 ease-luxury",
            fit === "contain" ? "object-contain object-center" : "object-cover object-center",
            loaded ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes}
          className={cn(
            "h-full w-full transition-opacity duration-700 ease-luxury",
            fit === "contain" ? "object-contain object-center" : "object-cover object-center",
            loaded ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
        />
      )}
    </div>
  );
}
