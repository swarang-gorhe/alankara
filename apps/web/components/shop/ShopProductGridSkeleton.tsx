import { cn } from "@/lib/utils";

type ShopProductGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function ShopProductGridSkeleton({ count = 8, className }: ShopProductGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8 lg:grid-cols-4",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-sm bg-gradient-to-br from-linen via-cotton/60 to-linen" />
          <div className="mt-3 space-y-2 md:mt-4">
            <div className="h-2.5 w-16 rounded-full bg-linen" />
            <div className="h-4 w-3/4 rounded-full bg-cotton" />
            <div className="hidden h-3 w-full rounded-full bg-linen sm:block" />
            <div className="h-4 w-20 rounded-full bg-champagne/25" />
          </div>
        </div>
      ))}
    </div>
  );
}
