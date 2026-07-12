import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 rounded-full font-body text-xs font-medium tracking-wide",
    "transition-all duration-base ease-luxury",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-linen",
    "disabled:pointer-events-none disabled:opacity-45",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border border-sage/45 bg-cotton text-ink hover:border-champagne/50 hover:bg-ivory",
        active:
          "border border-champagne/70 bg-maroon text-ivory shadow-[0_0_12px_rgba(201,147,47,0.2)]",
        outline:
          "border border-champagne/40 bg-transparent text-maroon hover:bg-cotton",
      },
      size: {
        default: "h-8 px-4",
        sm: "h-7 px-3 text-[11px]",
        lg: "h-9 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(chipVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
