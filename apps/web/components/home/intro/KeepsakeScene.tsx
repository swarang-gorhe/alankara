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

  const ribbonY = useTransform(scrollYProgress, [0.06, 0.22], [0, -36]);
  const ribbonOpacity = useTransform(scrollYProgress, [0.14, 0.28], [1, 0]);
  // Start slightly tilted so the closed tin already has a wall; then hinge open.
  const lidRotate = useTransform(scrollYProgress, [0, 0.2, 0.46], [16, 16, -108]);
  const lidY = useTransform(scrollYProgress, [0.2, 0.46], [0, -10]);
  const innerLight = useTransform(scrollYProgress, [0.34, 0.52], [0, 1]);
  const jewelleryOpacity = useTransform(scrollYProgress, [0.32, 0.48], [0, 1]);
  const logoOpacity = useTransform(scrollYProgress, [0.5, 0.64], [0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.5, 0.68], [0.82, 1]);
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
              className="absolute left-1/2 top-[84%] h-9 w-[58%] -translate-x-1/2 rounded-[100%] bg-ink/30 blur-2xl"
              aria-hidden
            />

            {/* Cylinder wall sitting just below the lid */}
            <div
              className="absolute inset-[10%] translate-y-[7%] rounded-full bg-gradient-to-b from-[#d4b07a] via-[#b88950] to-[#7a5428] shadow-luxury"
              aria-hidden
            />
            <div
              className="absolute inset-x-[18%] bottom-[6%] h-[12%] rounded-[100%] bg-ink/20 blur-md"
              aria-hidden
            />

            {/* Velvet well */}
            <div className="absolute inset-[13%] overflow-hidden rounded-full bg-gradient-to-b from-[#7a2a1c] to-[#2f1014] ring-1 ring-champagne/30">
              <motion.div
                className="absolute inset-[16%] flex items-center justify-center"
                style={{ opacity: jewelleryOpacity }}
              >
                <LuxuryImage
                  src="/products/kesari-diamond-drops.webp"
                  alt=""
                  fill
                  fit="contain"
                  sizes="28vw"
                  className="bg-transparent"
                  imageClassName="object-contain p-[12%]"
                />
              </motion.div>
            </div>

            {/* Cloth lid — slightly tilted at rest so the tin has a wall */}
            <motion.div
              className="absolute inset-[8%] overflow-hidden rounded-full border-[3px] border-[#f0ddc0] shadow-luxury-lg"
              style={{
                rotateX: lidRotate,
                y: lidY,
                transformPerspective: 900,
                transformOrigin: "50% 10%",
                backfaceVisibility: "hidden",
              }}
            >
              <LuxuryImage
                src={MEDIA.silkCream.src}
                alt=""
                fill
                fit="cover"
                priority
                sizes="70vw"
                className="absolute inset-0"
              />
              <div className="linen-grain absolute inset-0 opacity-50 mix-blend-multiply" />
              <div className="absolute inset-[7%] rounded-full border border-dashed border-maroon/25" />
              <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#8a6234]/55 to-transparent" />
            </motion.div>

            {/* Bow sits on the lid, then lifts off — never slides sideways */}
            <motion.div
              className="absolute left-1/2 top-[22%] z-30 -translate-x-1/2"
              style={{ y: ribbonY, opacity: ribbonOpacity }}
              aria-hidden
            >
              <RibbonBow />
            </motion.div>

            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{ opacity: logoOpacity, scale: logoScale }}
            >
              <AnimatedLogo variant="full" size={148} playEntrance={false} priority />
            </motion.div>
          </div>
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
    <svg viewBox="0 0 120 70" className="h-14 w-[5.6rem] drop-shadow-md md:h-16 md:w-[6.4rem]" aria-hidden>
      <path d="M60 28 C38 6 12 10 14 26 C16 40 42 40 60 32 C78 40 104 40 106 26 C108 10 82 6 60 28Z" fill="#6f2317" />
      <path d="M60 28 C42 10 22 14 24 26 C26 36 46 38 60 32 C74 38 94 36 96 26 C98 14 78 10 60 28Z" fill="#c9932f" />
      <ellipse cx="60" cy="32" rx="9" ry="11" fill="#5c1c14" />
      <path d="M54 40 L44 66 L58 46 Z" fill="#9a3a28" />
      <path d="M66 40 L76 66 L62 46 Z" fill="#c9932f" />
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
        <AnimatedLogo variant="full" size={160} playEntrance={false} priority />
        <p className="mt-6 font-display text-sm tracking-[0.32em] text-maroon">Welcome back</p>
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
