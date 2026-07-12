import { cn } from "@/lib/utils";

type SectionDividerProps = {
  className?: string;
};

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div className={cn("relative flex items-center justify-center px-6 py-10", className)}>
      <div className="hairline-gold w-full max-w-md" aria-hidden="true" />
      <div
        className="absolute h-2 w-2 rounded-full bg-champagne shadow-[0_0_10px_rgba(201,147,47,0.45)]"
        aria-hidden="true"
      />
    </div>
  );
}
