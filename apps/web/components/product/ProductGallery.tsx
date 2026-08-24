"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProductStill } from "@/components/media";
import { getProductMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  name: string;
  slug: string;
  images: string[];
};

export function ProductGallery({ name, slug, images }: ProductGalleryProps) {
  const media = getProductMedia(slug, images);
  const gallery = media.gallery.length > 0 ? media.gallery : [media.main];
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = gallery[index] ?? media.main;

  const next = useCallback(() => setIndex((i) => (i + 1) % gallery.length), [gallery.length]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + gallery.length) % gallery.length),
    [gallery.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, next, prev]);

  const isProductShot = current === media.main;

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      <div
        className="flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden"
        role="tablist"
        aria-label="Product images"
      >
        {gallery.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden border",
              i === index ? "border-champagne" : "border-sage/30",
            )}
            aria-label={`View image ${i + 1}`}
          >
            <ProductStill
              name=""
              slug={slug}
              image={src === media.main ? media.main : src}
              aspect="square"
              sizes="64px"
              className="h-full w-full"
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="relative min-w-0 flex-1 overflow-hidden border border-champagne/20 bg-ivory text-left"
        aria-label="Open image lightbox"
      >
        {isProductShot ? (
          <ProductStill
            name={name}
            slug={slug}
            image={media.main}
            aspect="portrait"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="min-h-[320px] lg:min-h-[min(70vh,640px)]"
          />
        ) : (
          <ProductStill
            name={name}
            slug={slug}
            image={current}
            aspect="portrait"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="min-h-[320px] lg:min-h-[min(70vh,640px)]"
          />
        )}
      </button>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ivory/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-maroon"
              aria-label="Close lightbox"
              onClick={() => setLightbox(false)}
            >
              <X />
            </button>
            <div
              className="relative h-[min(90dvh,900px)] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                const x = e.changedTouches[0]?.clientX ?? 0;
                (e.currentTarget as HTMLElement).dataset.x = String(x);
              }}
              onTouchEnd={(e) => {
                const start = Number((e.currentTarget as HTMLElement).dataset.x ?? 0);
                const end = e.changedTouches[0]?.clientX ?? start;
                if (end - start > 50) prev();
                if (start - end > 50) next();
              }}
            >
              <ProductStill
                name={name}
                slug={slug}
                image={current}
                aspect="auto"
                sizes="100vw"
                className="h-full w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
