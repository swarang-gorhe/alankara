"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { FloatingThreads } from "@/components/decor/FloatingThreads";
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import { LuxuryImage } from "@/components/media";
import { MEDIA } from "@/lib/media";
import { useIntro } from "@/contexts/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro/storage";
import { cn } from "@/lib/utils";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Signature opening: a round handmade textile keepsake on ivory linen.
 * Scroll unfolds ribbon → lid → light → logo bloom → tagline → fabric into the homepage.
 */
export function KeepsakeScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const completedRef = useRef(false);
  const { setPhase, completeIntro, phase } = useIntro();
  const prefersReducedMotion = usePrefersReducedMotion();
  const returning = hasSeenIntro();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const ribbonX = useTransform(scrollYProgress, [0.08, 0.24], [0, 140]);
  const ribbonRotate = useTransform(scrollYProgress, [0.08, 0.24], [0, -28]);
  const ribbonOpacity = useTransform(scrollYProgress, [0.18, 0.32], [1, 0]);
  const lidRotate = useTransform(scrollYProgress, [0.22, 0.42], [0, -118]);
  const lidY = useTransform(scrollYProgress, [0.22, 0.42], [0, -18]);
  const innerLight = useTransform(scrollYProgress, [0.36, 0.52], [0, 1]);
  const jewelleryOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  const logoOpacity = useTransform(scrollYProgress, [0.5, 0.64], [0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.5, 0.68], [0.72, 1]);
  const taglineOpacity = useTransform(scrollYProgress, [0.76, 0.86], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.76, 0.86], [24, 0]);
  const fabricScale = useTransform(scrollYProgress, [0.84, 1], [0.2, 8]);
  const fabricOpacity = useTransform(scrollYProgress, [0.84, 0.94, 1], [0, 1, 1]);
  const boxScale = useTransform(scrollYProgress, [0.86, 1], [1, 0.88]);
  const boxOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);
  const lightGlow = useMotionTemplate`radial-gradient(circle at 50% 42%, rgba(250,243,231,${innerLight}) 0%, transparent 62%)`;

  useEffect(() => {
    if (returning || prefersReducedMotion) {
      if (phase === "pending" || phase === "intro") {
        markIntroSeen();
        completeIntro();
      }
    } else {
      setPhase("intro");
    }
  }, [returning, prefersReducedMotion, completeIntro, setPhase, phase]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (returning || prefersReducedMotion || completedRef.current) return;
    if (value > 0.52 && value < 0.86) setPhase("bloom");
    if (value >= 0.96) {
      completedRef.current = true;
      markIntroSeen();
      completeIntro();
    }
  });

  if (returning || prefersReducedMotion) {
    return <ArrivalStill />;
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[340vh] bg-ivory md:h-[380vh]"
      aria-label="The arrival — opening the Alankara keepsake"
    >
      <div className="keepsake-scene sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <p className="absolute left-5 top-6 z-10 font-body text-[10px] uppercase tracking-[0.32em] text-olive/80 md:left-8 md:top-8">
          Chapter 01 — The arrival
        </p>
        <p className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-body text-[10px] uppercase tracking-[0.28em] text-olive/80">
          Scroll to open
        </p>
        <LuxuryImage
          src={MEDIA.linenDrape.src}
          alt=""
          width={MEDIA.linenDrape.width}
          height={MEDIA.linenDrape.height}
          fit="cover"
          priority
          sizes="100vw"
          className="absolute inset-0"
          imageClassName="scale-110"
        />
        <div className="absolute inset-0 bg-ivory/35" aria-hidden />
        <GrainOverlay />
        <FloatingThreads count={6} />

        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: lightGlow }}
          aria-hidden
        />

        <motion.div
          className="relative z-10 flex flex-col items-center px-4"
          style={{ scale: boxScale, opacity: boxOpacity }}
        >
          <div className="relative h-[min(72vw,22rem)] w-[min(72vw,22rem)] md:h-[28rem] md:w-[28rem]">
            {/* Shadow on linen */}
            <div
              className="absolute left-1/2 top-[78%] h-10 w-[70%] -translate-x-1/2 rounded-[100%] bg-ink/20 blur-xl"
              aria-hidden
            />

            {/* Round textile box body */}
            <div className="absolute inset-[8%] rounded-full border border-champagne/30 bg-gradient-to-b from-[#f4e6cf] via-[#e8d3b0] to-[#d9c19a] shadow-luxury-lg">
              <div className="linen-grain absolute inset-0 rounded-full opacity-60" />
              <div className="absolute inset-[7%] rounded-full border border-dashed border-maroon/25" />
              <div className="absolute inset-x-[18%] top-[46%] h-px bg-gradient-to-r from-transparent via-champagne/50 to-transparent" />
            </div>

            {/* Interior lining + jewellery hint */}
            <motion.div
              className="absolute inset-[16%] overflow-hidden rounded-full bg-gradient-to-b from-[#5a1c16] to-[#3d1520]"
              style={{ opacity: jewelleryOpacity }}
            >
              <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(250,243,231,0.35),transparent_62%)]" />
              <svg
                viewBox="0 0 120 120"
                className="absolute inset-[22%] text-champagne/80"
                aria-hidden
              >
                <circle cx="60" cy="48" r="16" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M60 36c4 6 10 10 10 16s-4.5 10-10 10-10-4-10-10 6-10 10-16z"
                  fill="#C9932F"
                  opacity="0.85"
                />
                <path d="M52 78h16M60 70v22" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="60" cy="96" r="3.2" fill="#E8C56A" />
              </svg>
            </motion.div>

            {/* Lid */}
            <motion.div
              className="absolute inset-[8%] origin-[50%_18%] rounded-full border border-champagne/40 bg-gradient-to-br from-[#faf3e7] via-[#edd9b6] to-[#c9a56a] shadow-luxury"
              style={{ rotateX: lidRotate, y: lidY }}
            >
              <div className="linen-grain absolute inset-0 rounded-full opacity-50" />
              <div className="absolute left-1/2 top-[18%] h-3 w-10 -translate-x-1/2 rounded-full bg-maroon/40" />
            </motion.div>

            {/* Ribbon */}
            <motion.div
              className="absolute left-1/2 top-[42%] z-20 h-3 w-[78%] -translate-x-1/2 rounded-sm bg-gradient-to-r from-[#6f2317] via-[#9a3a28] to-[#c9932f] shadow-sm"
              style={{ x: ribbonX, rotate: ribbonRotate, opacity: ribbonOpacity }}
            />
            <motion.div
              className="absolute left-[62%] top-[38%] z-20 h-16 w-8 origin-top bg-gradient-to-b from-[#6f2317] to-[#c9932f]"
              style={{
                clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)",
                opacity: ribbonOpacity,
                rotate: ribbonRotate,
              }}
            />
          </div>

          <motion.div
            className="mt-8 flex flex-col items-center"
            style={{ opacity: logoOpacity, scale: logoScale }}
          >
            <AnimatedLogo
              variant="full"
              size={120}
              playEntrance={false}
              showTagline={false}
              priority
            />
          </motion.div>

          <motion.p
            className="mt-5 max-w-md text-center font-script text-2xl italic text-maroon md:text-4xl"
            style={{ opacity: taglineOpacity, y: taglineY }}
          >
            Crafted for little moments.
          </motion.p>
        </motion.div>

        {/* Fabric lining expands into the homepage */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-40 w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
          style={{ scale: fabricScale, opacity: fabricOpacity }}
          aria-hidden
        >
          <LuxuryImage
            src={MEDIA.creamFolds.src}
            alt=""
            width={MEDIA.creamFolds.width}
            height={MEDIA.creamFolds.height}
            fit="cover"
            sizes="100vw"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-ivory/30" />
        </motion.div>
      </div>
    </section>
  );
}

function ArrivalStill() {
  return (
    <section
      className="relative flex min-h-[88dvh] items-center justify-center overflow-hidden bg-ivory px-6 py-24"
      aria-label="Welcome to Alankara"
    >
      <LuxuryImage
        src={MEDIA.linenDrape.src}
        alt=""
        width={MEDIA.linenDrape.width}
        height={MEDIA.linenDrape.height}
        fit="cover"
        priority
        sizes="100vw"
        className="absolute inset-0 opacity-70"
      />
      <div className="absolute inset-0 bg-ivory/50" aria-hidden />
      <GrainOverlay />
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="mb-10 font-body text-[10px] uppercase tracking-[0.32em] text-olive">
          Chapter 01 — The arrival
        </p>
        <AnimatedLogo variant="full" size={110} playEntrance={false} priority />
        <p className="mt-8 font-display text-sm tracking-[0.32em] text-maroon">ALANKARA</p>
        <p className="mt-4 font-script text-2xl italic text-warm-brown md:text-4xl">
          Crafted for little moments.
        </p>
      </div>
    </section>
  );
}

export function KeepsakeSkipHint({ className }: { className?: string }) {
  return (
    <p className={cn("font-body text-[10px] uppercase tracking-[0.28em] text-olive", className)}>
      Scroll to open
    </p>
  );
}
