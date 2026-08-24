"use client";

import { X } from "lucide-react";
import { FlowerMotif } from "@/components/brand/FlowerMotif";
import { LOGO_MARK_SRC } from "@/components/brand/AnimatedLogo";

type TryOnHeaderProps = {
  productName: string;
  onClose: () => void;
};

export function TryOnHeader({ productName, onClose }: TryOnHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-champagne/30 bg-gradient-to-r from-linen via-ivory to-cotton px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_MARK_SRC} alt="" className="h-9 w-9 object-contain" />
        <div className="min-w-0">
          <p className="font-display text-lg leading-none text-maroon">Try It On</p>
          <p className="mt-1 truncate font-body text-[11px] uppercase tracking-[0.14em] text-olive">
            {productName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FlowerMotif className="hidden h-5 w-5 text-champagne sm:block" />
        <button
          type="button"
          onClick={onClose}
          className="border border-champagne/40 bg-ivory p-2 text-maroon hover:border-maroon/40"
          aria-label="Close try-on"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
