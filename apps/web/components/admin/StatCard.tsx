import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
};

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-gold/25 bg-cream-light px-5 py-4 paper-card",
        className,
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold">{label}</p>
      <p className="mt-2 font-display text-2xl text-maroon">{value}</p>
      {hint && <p className="mt-1 text-xs text-charcoal-muted">{hint}</p>}
    </div>
  );
}
