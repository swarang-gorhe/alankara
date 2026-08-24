"use client";

import type { ManualAdjust } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";

type ManualAdjustControlsProps = {
  value: ManualAdjust;
  onChange: (next: ManualAdjust) => void;
};

const FIELDS: Array<{ key: keyof ManualAdjust; label: string; min: number; max: number; step: number }> = [
  { key: "zoom", label: "Zoom", min: 0.8, max: 1.4, step: 0.02 },
  { key: "offsetX", label: "Move X", min: -20, max: 20, step: 0.5 },
  { key: "offsetY", label: "Move Y", min: -20, max: 20, step: 0.5 },
  { key: "scale", label: "Scale", min: 0.5, max: 1.8, step: 0.05 },
  { key: "rotation", label: "Rotate", min: -25, max: 25, step: 0.5 },
];

export function ManualAdjustControls({ value, onChange }: ManualAdjustControlsProps) {
  return (
    <div className="space-y-3 border border-champagne/30 bg-linen/50 p-3">
      <div className="flex items-center justify-between">
        <p className="font-body text-[10px] uppercase tracking-widest text-olive">Fine adjust</p>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_MANUAL_ADJUST)}
          className="font-body text-[10px] uppercase tracking-widest text-maroon"
        >
          Reset
        </button>
      </div>
      {FIELDS.map((field) => (
        <label key={field.key} className="block">
          <div className="mb-1 flex justify-between font-body text-[10px] uppercase tracking-widest text-ink-muted">
            <span>{field.label}</span>
            <span className="font-mono">{value[field.key]}</span>
          </div>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value[field.key]}
            onChange={(e) => onChange({ ...value, [field.key]: Number(e.target.value) })}
            className="w-full accent-maroon"
          />
        </label>
      ))}
    </div>
  );
}
