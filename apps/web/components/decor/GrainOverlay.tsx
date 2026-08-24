import { cn } from "@/lib/utils";

export function GrainOverlay({ className }: { className?: string }) {
  return <div className={cn("paper-grain pointer-events-none absolute inset-0", className)} aria-hidden />;
}
