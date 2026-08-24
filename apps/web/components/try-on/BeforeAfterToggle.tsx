"use client";

import { cn } from "@/lib/utils";

type BeforeAfterToggleProps = {
  showAfter: boolean;
  onChange: (showAfter: boolean) => void;
};

export function BeforeAfterToggle({ showAfter, onChange }: BeforeAfterToggleProps) {
  return (
    <div className="flex border border-champagne/35 bg-ivory p-0.5" role="group" aria-label="Before and after">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "flex-1 px-3 py-1.5 font-body text-[10px] uppercase tracking-widest",
          !showAfter ? "bg-maroon text-ivory" : "text-maroon",
        )}
      >
        Before
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "flex-1 px-3 py-1.5 font-body text-[10px] uppercase tracking-widest",
          showAfter ? "bg-maroon text-ivory" : "text-maroon",
        )}
      >
        After
      </button>
    </div>
  );
}
