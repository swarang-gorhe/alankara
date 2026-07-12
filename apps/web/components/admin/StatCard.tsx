import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

export function StatCard({ label, value, hint, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-admin-border bg-admin-surface px-5 py-4",
        className,
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-admin-muted">{label}</p>
      <p className="mt-2 font-display text-2xl text-admin-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
      {trend && (
        <span
          className={cn(
            "mt-2 inline-block text-[10px] uppercase tracking-widest",
            trend === "up" && "text-admin-success",
            trend === "down" && "text-admin-danger",
            trend === "neutral" && "text-admin-muted",
          )}
        >
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
        </span>
      )}
    </div>
  );
}
