import { SectionDivider } from "@/components/ui/SectionDivider";

export default function HomePage() {
  return (
    <div className="relative">
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-script text-2xl italic text-gold md:text-3xl">
          Crafted for little moments.
        </p>
        <h1 className="mt-6 max-w-2xl font-display text-4xl leading-tight text-maroon md:text-6xl">
          Where artisan hands meet heirloom beauty
        </h1>
        <p className="mt-6 max-w-lg text-charcoal-muted">
          Phase 1 foundation is live. The cinematic homepage arrives in Phase 2 — scroll
          narratives, Three.js hero, and luxury motion design.
        </p>
      </section>

      <SectionDivider />

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl text-maroon">Coming Soon</h2>
        <p className="mt-4 text-charcoal-muted">
          Shop collections, artisan stories, and AI-powered reviews — built with care, one phase
          at a time.
        </p>
      </section>
    </div>
  );
}
