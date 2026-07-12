import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-sm border bg-ivory px-4 font-body text-sm text-ink",
          "placeholder:text-ink-muted/60",
          "transition-colors duration-base ease-luxury",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-linen",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-error-muted focus-visible:ring-error-muted"
            : "border-sage/50 hover:border-champagne/40 focus-visible:border-champagne/60",
          className,
        )}
        ref={ref}
        aria-invalid={error || undefined}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
