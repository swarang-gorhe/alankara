import { cn } from "@/lib/utils";

type GoldDividerProps = {
  className?: string;
  width?: "sm" | "md" | "lg" | "full";
  /** champagne on light surfaces; antique on deep-wine sections */
  tone?: "champagne" | "antique";
};

const widthClasses = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "max-w-full",
};

const toneGradients = {
  champagne:
    "linear-gradient(90deg, transparent 0%, #C9932F 18%, #E8C56A 50%, #C9932F 82%, transparent 100%)",
  antique:
    "linear-gradient(90deg, transparent 0%, #C9A227 18%, #E8D48A 50%, #C9A227 82%, transparent 100%)",
};

/** Thin gold line with centre dot — from poster dividers */
export function GoldDivider({
  className,
  width = "md",
  tone = "champagne",
}: GoldDividerProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center py-2",
        widthClasses[width],
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="h-px w-full"
        style={{ background: toneGradients[tone] }}
      />
      <div
        className={cn(
          "absolute h-2 w-2 rounded-full shadow-[0_0_8px_rgba(201,147,47,0.5)]",
          tone === "antique" ? "bg-antique-gold" : "bg-champagne",
        )}
      />
    </div>
  );
}

type HeartsDividerProps = {
  className?: string;
};

/** Vertical hearts divider from welcome poster */
export function HeartsDivider({ className }: HeartsDividerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-3", className)} aria-hidden="true">
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        <path
          d="M7 11 C7 11 1 7 1 4 C1 2 2.5 1 4 1 C5.2 1 6.2 1.6 7 2.4 C7.8 1.6 8.8 1 10 1 C11.5 1 13 2 13 4 C13 7 7 11 7 11Z"
          stroke="#C9932F"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <svg width="14" height="12" viewBox="0 0 14 12" fill="#C9932F" opacity="0.85">
        <path d="M7 11 C7 11 1 7 1 4 C1 2 2.5 1 4 1 C5.2 1 6.2 1.6 7 2.4 C7.8 1.6 8.8 1 10 1 C11.5 1 13 2 13 4 C13 7 7 11 7 11Z" />
      </svg>
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        <path
          d="M7 11 C7 11 1 7 1 4 C1 2 2.5 1 4 1 C5.2 1 6.2 1.6 7 2.4 C7.8 1.6 8.8 1 10 1 C11.5 1 13 2 13 4 C13 7 7 11 7 11Z"
          stroke="#C9932F"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}
