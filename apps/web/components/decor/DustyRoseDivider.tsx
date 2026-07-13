import { cn } from "@/lib/utils";

type DustyRoseDividerProps = {
  className?: string;
  width?: "sm" | "md" | "lg";
};

const widthClasses = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
};

/** Delicate dusty-rose rule — dried-petal tone for dark or light sections */
export function DustyRoseDivider({ className, width = "md" }: DustyRoseDividerProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center py-2",
        widthClasses[width],
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #B98277 22%, #D4A59C 50%, #B98277 78%, transparent 100%)",
        }}
      />
      <div className="absolute h-1.5 w-1.5 rounded-full bg-dusty-rose/80" />
    </div>
  );
}
