import { CraftPillars } from "@/components/decor/CraftPillarIcons";

/** Trust / feature bar below hero */
export function FeatureBar() {
  return (
    <section className="border-y border-olive/30 bg-olive px-6 py-6" aria-label="Why Alankara">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 text-center md:justify-between md:gap-4 md:text-left">
        <p className="font-body text-[10px] uppercase tracking-[0.28em] text-ivory/90 md:text-xs">
          Handmade with love
        </p>
        <p className="font-body text-[10px] uppercase tracking-[0.28em] text-ivory/90 md:text-xs">
          Lightweight &amp; skin-kind
        </p>
        <p className="font-body text-[10px] uppercase tracking-[0.28em] text-ivory/90 md:text-xs">
          Small batches
        </p>
        <p className="font-body text-[10px] uppercase tracking-[0.28em] text-ivory/90 md:text-xs">
          Made in India
        </p>
      </div>
    </section>
  );
}
