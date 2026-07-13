import { GoldDivider } from "@/components/decor/GoldDivider";
import { cn } from "@/lib/utils";

type SectionDividerProps = {
  className?: string;
};

export function SectionDivider({ className }: SectionDividerProps) {
  return <GoldDivider width="lg" className={cn("px-6 py-6 md:py-8", className)} />;
}
