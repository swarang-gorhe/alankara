import { cn } from "@/lib/utils";

type ImageSkeletonProps = {
  className?: string;
};

/** Soft fabric-toned shimmer — never a grey box. */
export function ImageSkeleton({ className }: ImageSkeletonProps) {
  return (
    <div
      className={cn("fabric-shimmer absolute inset-0", className)}
      aria-hidden="true"
    />
  );
}
