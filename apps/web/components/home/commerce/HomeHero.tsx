"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { FlowerDivider } from "@/components/brand/FlowerMotif";
import { LuxuryImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import { ATELIER_MEDIA } from "@/lib/media";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="absolute inset-0 bg-gradient-to-b from-linen/60 via-ivory to-ivory" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <motion.div
          className="flex flex-col items-center text-center lg:col-span-5 lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <AnimatedLogo variant="full" size={148} playEntrance priority className="md:hidden" />
          <AnimatedLogo
            variant="full"
            size={188}
            playEntrance
            priority
            className="hidden md:flex"
          />
          <FlowerDivider className="mt-8" />
          <h1 className="mt-6 font-display text-4xl leading-tight text-maroon sm:text-5xl lg:text-6xl text-balance">
            Crafted for little moments.
          </h1>
          <p className="mt-4 max-w-md font-body text-base leading-relaxed text-ink-muted sm:text-lg">
            Handmade cloth jewellery, thoughtfully made for everyday beauty.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button asChild size="lg">
              <Link href="/shop">Shop collection</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/shop">See it on you</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/customize">Customize yours</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative lg:col-span-7"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-champagne/20 bg-linen/40 shadow-luxury">
            <LuxuryImage
              src={ATELIER_MEDIA.heroEarrings.src}
              alt={ATELIER_MEDIA.heroEarrings.alt}
              width={ATELIER_MEDIA.heroEarrings.width}
              height={ATELIER_MEDIA.heroEarrings.height}
              fit="contain"
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="aspect-square w-full bg-gradient-to-b from-ivory to-linen"
            />
          </div>
          <p className="mt-4 text-center font-body text-[11px] uppercase tracking-[0.22em] text-olive lg:text-left">
            Cloth · pearls · gold-tone findings
          </p>
        </motion.div>
      </div>
    </section>
  );
}
