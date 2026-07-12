import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "magnetic-ready inline-flex items-center justify-center whitespace-nowrap rounded-sm font-body text-sm font-medium",
    "transition-all duration-base ease-luxury",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-linen",
    "disabled:pointer-events-none disabled:opacity-45",
    "motion-safe:animate-button-breathe",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-maroon text-ivory shadow-luxury hover:bg-warm-brown hover:shadow-luxury-lg active:scale-[0.98]",
        outline:
          "border border-champagne/60 bg-transparent text-maroon hover:border-champagne hover:bg-cotton hover:text-warm-brown",
        ghost: "text-maroon hover:bg-cotton hover:text-warm-brown",
        link: "text-champagne underline-offset-4 hover:text-warm-brown hover:underline motion-safe:animate-none",
        secondary:
          "border border-sage/40 bg-cotton text-ink hover:border-olive/50 hover:bg-ivory",
      },
      size: {
        default: "h-11 px-7 py-2.5",
        sm: "h-9 px-5 text-xs tracking-wide",
        lg: "h-12 px-9 text-base",
        icon: "h-11 w-11 motion-safe:animate-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
