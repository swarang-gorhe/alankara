"use client";

import { motion } from "framer-motion";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function HomeFooterSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section
      className="relative overflow-hidden px-6 py-24 md:py-32"
      aria-label="Newsletter"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream-light/80 to-transparent" />

      <div className="relative mx-auto max-w-2xl text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AnimatedLogo size={72} className="mx-auto" />
        </motion.div>

        <h2 className="mt-8 font-display text-3xl text-maroon md:text-4xl">
          Join our circle
        </h2>
        <p className="mt-4 text-charcoal-muted">
          Be the first to discover new collections, atelier stories, and exclusive previews.
        </p>

        <form
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="your@email.com"
            className="h-12 flex-1 rounded-sm border border-gold/30 bg-cream-light px-4 text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:max-w-xs"
          />
          <Button type="submit" data-magnetic data-cursor-sparkle>
            Subscribe
          </Button>
        </form>

        <p className="mt-4 text-xs text-charcoal-muted">
          Newsletter coming soon — your interest warms our atelier.
        </p>
      </div>
    </section>
  );
}
