"use client";

import { cn } from "@/lib/utils";

type PearlRatingProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

export function PearlRating({ rating, max = 5, size = "sm", className }: PearlRatingProps) {
  const dim = size === "md" ? "h-3.5 w-3.5" : "h-2.5 w-2.5";
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`${rating} out of ${max} pearls`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full border",
            dim,
            i < rating
              ? "border-champagne bg-champagne shadow-[0_0_6px_rgba(201,147,47,0.45)]"
              : "border-champagne/40 bg-transparent",
          )}
        />
      ))}
    </div>
  );
}

type PearlRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export function PearlRatingInput({ value, onChange }: PearlRatingInputProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const score = i + 1;
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            onClick={() => onChange(score)}
            className="rounded-full p-1"
          >
            <span
              className={cn(
                "block h-4 w-4 rounded-full border transition-colors",
                score <= value
                  ? "border-champagne bg-champagne"
                  : "border-champagne/40 bg-ivory hover:border-champagne",
              )}
            />
            <span className="sr-only">{score} pearls</span>
          </button>
        );
      })}
    </div>
  );
}
