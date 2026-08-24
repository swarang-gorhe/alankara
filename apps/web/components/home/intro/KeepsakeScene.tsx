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
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import { LuxuryImage } from "@/components/media";
import { MEDIA } from "@/lib/media";
import { useIntro } from "@/contexts/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro/storage";
import { cn } from "@/lib/utils";

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

  const ribbonX = useTransform(scrollYProgress, [0.06, 0.22], [0, 22]);
  const ribbonRotate = useTransform(scrollYProgress, [0.06, 0.22], [0, -12]);
  const ribbonOpacity = useTransform(scrollYProgress, [0.16, 0.3], [1, 0]);
  const lidRotate = useTransform(scrollYProgress, [0.22, 0.44], [0, -105]);
  const lidY = useTransform(scrollYProgress, [0.22, 0.44], [0, -8]);
  const innerLight = useTransform(scrollYProgress, [0.34, 0.52], [0, 1]);
  const jewelleryOpacity = useTransform(scrollYProgress, [0.32, 0.48], [0, 1]);
  const logoOpacity = useTransform(scrollYProgress, [0.5, 0.64], [0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.5, 0.68], [0.82, 1]);
  const taglineOpacity = useTransform(scrollYProgress, [0.66, 0.78], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.66, 0.78], [16, 0]);
  const fabricScale = useTransform(scrollYProgress, [0.84, 1], [0.18, 9]);
  const fabricOpacity = useTransform(scrollYProgress, [0.84, 0.94, 1], [0, 1, 1]);
  const boxScale = useTransform(scrollYProgress, [0.86, 1], [1, 0.9]);
  const boxOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);
  const lightGlow = useMotionTemplate`radial-gradient(circle at 50% 42%, rgba(250,243,231,${innerLight}) 0%, transparent 58%)`;

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
      className="relative h-[280vh] bg-ivory md:h-[340vh]"
      aria-label="The arrival — opening the Alankara keepsake"
    >
      <div className="keepsake-scene sticky top-0 flex h-dvh items-center justify-center overflow-hidden px-6">
        <p className="absolute left-5 top-[max(1.25rem,env(safe-area-inset-top))] z-10 font-body text-[10px] uppercase tracking-[0.32em] text-olive md:left-8 md:top-8">
          Chapter 01 — The arrival
        </p>
        <p className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 font-body text-[10px] uppercase tracking-[0.28em] text-olive md:bottom-24">
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
        <div className="absolute inset-0 bg-ivory/45" aria-hidden />
        <GrainOverlay />

        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: lightGlow }}
          aria-hidden
        />

        <motion.div
          className="relative z-10 flex w-full max-w-[20.5rem] flex-col items-center md:max-w-[26rem]"
          style={{ scale: boxScale, opacity: boxOpacity }}
        >
          <div className="keepsake-box relative aspect-square w-full">
            <div
              className="absolute left-1/2 top-[82%] h-8 w-[62%] -translate-x-1/2 rounded-[100%] bg-ink/25 blur-2xl md:h-10"
              aria-hidden
            />

            {/* Side wall — gives the disc a tin/box thickness */}
            <div
              className="absolute inset-[9%] translate-y-[5%] rounded-full bg-gradient-to-b from-[#c4a06a] to-[#9a7548] shadow-luxury"
              aria-hidden
            />

            {/* Box well */}
            <div className="absolute inset-[11%] overflow-hidden rounded-full border border-champagne/25 bg-gradient-to-b from-[#6b2418] to-[#3a1418]">
              <LuxuryImage
                src={MEDIA.creamFolds.src}
                alt=""
                width={MEDIA.creamFolds.width}
                height={MEDIA.creamFolds.height}
                fit="cover"
                sizes="40vw"
                className="absolute inset-0 opacity-25"
              />
              <motion.div
                className="absolute inset-[18%] flex items-center justify-center"
                style={{ opacity: jewelleryOpacity }}
              >
                <LuxuryImage
                  src="/products/kesari-diamond-drops.webp"
                  alt=""
                  width={1024}
                  height={1024}
                  fit="contain"
                  sizes="30vw"
                  className="h-full w-full bg-transparent"
                  imageClassName="object-contain p-[8%]"
                />
              </motion.div>
            </div>

            {/* Lid — perspective lives on this node so it actually hinges */}
            <motion.div
              className="absolute inset-[8%] origin-[50%_8%] overflow-hidden rounded-full border border-[#e8d4b0] shadow-luxury-lg"
              style={{
                rotateX: lidRotate,
                y: lidY,
                transformPerspective: 1100,
                transformOrigin: "50% 8%",
                backfaceVisibility: "hidden",
              }}
            >
              <LuxuryImage
                src={MEDIA.creamFolds.src}
                alt=""
                width={MEDIA.creamFolds.width}
                height={MEDIA.creamFolds.height}
                fit="cover"
                sizes="50vw"
                className="absolute inset-0"
                imageClassName="scale-105"
              />
              <div className="linen-grain absolute inset-0 opacity-70 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#faf3e7]/50 via-transparent to-[#c9a56a]/35" />
              <div className="absolute inset-[6%] rounded-full border border-dashed border-maroon/20" />
              <div className="absolute left-1/2 top-[16%] h-2.5 w-9 -translate-x-1/2 rounded-full bg-maroon/55 shadow-sm" />
            </motion.div>

            {/* Ribbon wrap — stays on the box */}
            <motion.div
              className="absolute inset-x-[12%] top-1/2 z-20 h-2.5 -translate-y-1/2 rounded-sm bg-gradient-to-r from-[#6f2317] via-[#9a3a28] to-[#c9932f] shadow-sm md:h-3"
              style={{ opacity: ribbonOpacity }}
              aria-hidden
            />
            <motion.div
              className="absolute left-1/2 top-[42%] z-30 -translate-x-1/2"
              style={{ x: ribbonX, rotate: ribbonRotate, opacity: ribbonOpacity }}
              aria-hidden
            >
              <RibbonBow />
            </motion.div>

            {/* Logo blooms from the open well, not under the box */}
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{ opacity: logoOpacity, scale: logoScale }}
            >
              <AnimatedLogo variant="mark" size={96} playEntrance={false} priority className="md:hidden" />
              <AnimatedLogo variant="full" size={88} playEntrance={false} priority className="hidden md:flex" />
            </motion.div>
          </div>

          <motion.p
            className="mt-8 max-w-[16rem] text-center font-script text-xl italic text-maroon md:mt-10 md:max-w-md md:text-4xl"
            style={{ opacity: taglineOpacity, y: taglineY }}
          >
            Crafted for little moments.
          </motion.p>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-36 w-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full md:h-40 md:w-40"
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

function RibbonBow() {
  return (
    <svg viewBox="0 0 88 48" className="h-10 w-[4.4rem] md:h-12 md:w-[5.4rem]" aria-hidden>
      <path
        d="M44 18 C28 4 8 8 10 20 C12 30 32 28 44 22 C56 28 76 30 78 20 C80 8 60 4 44 18Z"
        fill="#7a281c"
      />
      <path
        d="M44 18 C32 8 18 10 20 20 C22 28 36 28 44 22 C52 28 66 28 68 20 C70 10 56 8 44 18Z"
        fill="#c9932f"
        opacity="0.9"
      />
      <ellipse cx="44" cy="22" rx="7" ry="8" fill="#5c1c14" />
      <path d="M40 28 L32 46 L42 34 Z" fill="#9a3a28" />
      <path d="M48 28 L56 46 L46 34 Z" fill="#c9932f" />
    </svg>
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
        <AnimatedLogo variant="mark" size={120} playEntrance={false} priority className="md:hidden" />
        <AnimatedLogo variant="full" size={110} playEntrance={false} priority className="hidden md:flex" />
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
