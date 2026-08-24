"use client";

import { useState } from "react";
import { TryOnModal } from "./TryOnModal";
import { hasTryOnAsset } from "./tryOnAsset";
import type { TryOnProduct } from "./types";
import { cn } from "@/lib/utils";

type TryOnButtonProps = {
  product: TryOnProduct;
  className?: string;
  variant?: "primary" | "ghost" | "card";
  label?: string;
};

export function TryOnButton({
  product,
  className,
  variant = "primary",
  label = "Try It On",
}: TryOnButtonProps) {
  const [open, setOpen] = useState(false);

  if (!hasTryOnAsset(product)) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "font-body text-xs uppercase tracking-[0.16em] transition-colors",
          variant === "primary" &&
            "border border-champagne/50 bg-linen px-4 py-2.5 text-maroon hover:border-maroon/40 hover:bg-ivory",
          variant === "ghost" && "text-maroon underline-offset-4 hover:underline",
          variant === "card" &&
            "border border-ivory/50 bg-maroon/90 px-2.5 py-1.5 text-[10px] text-ivory shadow-sm",
          className,
        )}
      >
        {label}
      </button>
      <TryOnModal open={open} product={product} onClose={() => setOpen(false)} />
    </>
  );
}
