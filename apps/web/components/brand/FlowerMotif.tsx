import { cn } from "@/lib/utils";

/** Six-petal flower silhouette from the Alankara mark — use sparingly. */
export function FlowerMotif({
  className,
  tone = "champagne",
}: {
  className?: string;
  tone?: "champagne" | "maroon" | "olive" | "ivory";
}) {
  const fill =
    tone === "maroon"
      ? "#6F2317"
      : tone === "olive"
        ? "#6B7353"
        : tone === "ivory"
          ? "#FAF3E7"
          : "#C9932F";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      aria-hidden
      fill={fill}
    >
      <circle cx="32" cy="32" r="6" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="32"
          cy="18"
          rx="7"
          ry="11"
          transform={`rotate(${deg} 32 32)`}
          opacity="0.92"
        />
      ))}
    </svg>
  );
}

export function FlowerDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-champagne/50" />
      <FlowerMotif className="h-4 w-4" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-champagne/50" />
    </div>
  );
}
