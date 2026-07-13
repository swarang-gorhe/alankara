import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type JournalSpreadProps = {
  children: ReactNode;
  className?: string;
};

export function JournalSpread({ children, className }: JournalSpreadProps) {
  return <div className={cn("relative", className)}>{children}</div>;
}

export function PinnedNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-sm border border-champagne/25 bg-ivory/95 px-5 py-4 shadow-[0_4px_20px_rgba(43,35,28,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TornDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "my-12 h-px w-full bg-gradient-to-r from-transparent via-champagne/30 to-transparent",
        className,
      )}
      aria-hidden="true"
    />
  );
}
