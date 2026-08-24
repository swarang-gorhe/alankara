"use client";

import { LuxuryImage } from "@/components/media";
import { FlowerDivider } from "@/components/brand/FlowerMotif";
import { MAKE_STEPS } from "@/lib/media";

export function HomeMadeByHand() {
  return (
    <section className="bg-maroon px-5 py-16 text-ivory sm:px-8 md:py-24" aria-label="From fabric to jewellery">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="font-body text-[11px] uppercase tracking-[0.28em] text-champagne">Process</p>
          <h2 className="mt-3 font-display text-3xl text-ivory md:text-5xl">From fabric to jewellery</h2>
          <p className="mt-4 font-body text-base text-ivory/80">
            Fabric → shape → details → assemble → wear. Five steps, made by hand.
          </p>
        </div>
        <FlowerDivider className="mt-8 [&_span]:to-champagne/40 [&_svg]:fill-champagne" />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {MAKE_STEPS.map((step) => (
            <li key={step.id} className="flex flex-col">
              <div className="overflow-hidden rounded-2xl border border-champagne/20 bg-deep-wine/40">
                <LuxuryImage
                  src={step.image.src}
                  alt={step.image.alt}
                  width={step.image.width}
                  height={step.image.height}
                  fit="cover"
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className="aspect-[4/5] w-full"
                />
              </div>
              <span className="mt-4 font-body text-[11px] uppercase tracking-[0.28em] text-champagne">
                Step {step.id}
              </span>
              <h3 className="mt-2 font-display text-xl text-ivory">{step.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ivory/75">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
