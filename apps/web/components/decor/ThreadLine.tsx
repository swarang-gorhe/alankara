import { cn } from "@/lib/utils";

export function ThreadLine({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-champagne/70 to-champagne/20" />
      <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-champagne/70 to-champagne/20" />
    </div>
  );
}
