"use client";

import { useRef } from "react";
import { STORY_IMAGES } from "@/lib/editorial/story-images";
import { useChapterReveal } from "@/hooks/useChapterReveal";
import { cn } from "@/lib/utils";
import { EditorialFrame } from "./EditorialFrame";

type StoryMasonryProps = {
  className?: string;
  /** Subset of image ids to show */
  ids?: string[];
};

export function StoryMasonry({ className, ids }: StoryMasonryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useChapterReveal({ trigger: sectionRef, targets: gridRef, variant: "scale-in", stagger: 0.07 });

  const images = ids ? STORY_IMAGES.filter((img) => ids.includes(img.id)) : STORY_IMAGES;

  return (
    <div ref={sectionRef} className={className}>
      <div
        ref={gridRef}
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        style={{ gridAutoRows: "minmax(0, auto)" }}
      >
        {images.map((item, index) => (
          <div key={item.id} data-reveal className={cn("min-w-0", item.span)}>
            <EditorialFrame
              src={item.src}
              alt={item.alt}
              caption={item.caption}
              width={item.width}
              height={item.height}
              className="w-full"
              priority={index < 2}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
