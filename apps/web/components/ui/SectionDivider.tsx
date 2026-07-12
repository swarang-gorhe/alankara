import { cn } from "@/lib/utils";

type SectionDividerProps = {
  className?: string;
};

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div className={cn("relative flex items-center justify-center px-6 py-8", className)}>
      <div className="hairline-gold w-full max-w-md" aria-hidden="true" />
      <div
        className="absolute h-2 w-2 rounded-full bg-gold-bright shadow-[0_0_8px_rgba(201,147,47,0.4)]"
        aria-hidden="true"
      />
    </div>
  );
}
