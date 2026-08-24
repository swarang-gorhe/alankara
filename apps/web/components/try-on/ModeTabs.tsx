"use client";

import { cn } from "@/lib/utils";
import type { TryOnMode } from "./types";

type ModeTabsProps = {
  mode: TryOnMode;
  onChange: (mode: TryOnMode) => void;
  liveDisabled?: boolean;
};

export function ModeTabs({ mode, onChange, liveDisabled }: ModeTabsProps) {
  return (
    <div className="flex border border-champagne/35 bg-linen/50 p-1" role="tablist" aria-label="Try-on mode">
      {(
        [
          { id: "live" as const, label: "Try Live", disabled: liveDisabled },
          { id: "photo" as const, label: "Use a Photo", disabled: false },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={mode === tab.id}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 px-3 py-2 font-body text-[11px] uppercase tracking-[0.16em] transition-colors disabled:opacity-40",
            mode === tab.id ? "bg-maroon text-ivory" : "text-maroon hover:bg-ivory",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
