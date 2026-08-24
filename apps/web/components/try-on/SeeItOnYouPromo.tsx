"use client";

import Link from "next/link";
import { FlowerMotif } from "@/components/brand/FlowerMotif";
import { Button } from "@/components/ui/button";

/** Homepage promo — opens shop with try-on intent */
export function SeeItOnYouPromo() {
  return (
    <section className="relative overflow-hidden border-y border-champagne/20 bg-gradient-to-br from-linen via-ivory to-cotton px-5 py-16 sm:px-8 md:py-24">
      <div className="pointer-events-none absolute -right-10 top-8 opacity-20" aria-hidden>
        <FlowerMotif className="h-40 w-40 text-champagne" />
      </div>
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.28em] text-olive">Virtual try-on</p>
        <h2 className="mt-4 font-display text-4xl text-maroon md:text-5xl">See it on you</h2>
        <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-ink-muted md:text-lg">
          Hold a pair to your face with live camera or a photo — private on your device, calibrated
          for each Alankara earring.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/shop">Browse & try on</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
