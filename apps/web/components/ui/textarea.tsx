import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-sm border bg-ivory px-4 py-3 font-body text-sm text-ink",
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
Textarea.displayName = "Textarea";

export { Textarea };
