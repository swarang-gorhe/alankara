"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedLogo, LOGO_SHOWCASE_SIZE } from "@/components/brand/AnimatedLogo";
import { ClientErrorBoundary } from "@/components/ui/ClientErrorBoundary";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  INTRO_CHAPTER_BREAKS,
  INTRO_PIN_VH_DESKTOP,
  INTRO_PIN_VH_MOBILE,
} from "@/lib/intro/constants";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import {
  IntroChapterText,
  SilkTransformation,
  TreasureParticles,
} from "./IntroSceneLayers";
import { KeepsakeBoxVisual } from "./KeepsakeBoxVisual";
import { RibbonKnot } from "./RibbonKnot";

const IntroAtmosphere3D = dynamic(
  () => import("./IntroAtmosphere3D").then((mod) => mod.IntroAtmosphere3D),
  { ssr: false },
);

type OpeningSequenceProps = {
  onComplete: () => void;
  className?: string;
};

function chapterProgress(progress: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

export function OpeningSequence({ onComplete, className }: OpeningSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const completedRef = useRef(false);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  const pinVh = isMobile ? INTRO_PIN_VH_MOBILE : INTRO_PIN_VH_DESKTOP;

  const untyingProgress = chapterProgress(
    progress,
    INTRO_CHAPTER_BREAKS.arrivalEnd,
    INTRO_CHAPTER_BREAKS.untyingEnd,
  );
  const openingProgress = chapterProgress(
    progress,
    INTRO_CHAPTER_BREAKS.untyingEnd,
    INTRO_CHAPTER_BREAKS.openingEnd,
  );
  const revealProgress = chapterProgress(
    progress,
    INTRO_CHAPTER_BREAKS.openingEnd,
    INTRO_CHAPTER_BREAKS.revealEnd,
  );

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !containerRef.current || !pinRef.current) {
      handleComplete();
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${pinVh}vh`,
        pin: pinRef.current,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => {
          setProgress(self.progress);
          if (self.progress >= 0.995) {
            handleComplete();
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [pinVh, prefersReducedMotion, handleComplete]);

  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;
    const perfCheck = window.setTimeout(() => {
      const nav = navigator as Navigator & { deviceMemory?: number };
      if (!nav.deviceMemory || nav.deviceMemory >= 4) {
        setShow3D(true);
      }
    }, 100);
    return () => window.clearTimeout(perfCheck);
  }, [prefersReducedMotion, isMobile]);

  if (prefersReducedMotion) return null;

  const ribbonVisible = untyingProgress < 1 || progress < INTRO_CHAPTER_BREAKS.openingEnd;
  const showLogo = revealProgress > 0.12;
  const logoSize = isMobile ? LOGO_SHOWCASE_SIZE : LOGO_SHOWCASE_SIZE + 40;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ height: `${pinVh}vh` }}
      aria-hidden="true"
    >
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden bg-ivory">
        <FabricTexture id="intro-linen" opacity={0.06} />

        <div
          className="absolute inset-0 bg-gradient-to-b from-ivory via-linen/80 to-cotton/70"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,147,47,0.12) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {show3D && (
          <ClientErrorBoundary fallback={null}>
            <IntroAtmosphere3D
              className="absolute inset-0 opacity-70"
              mobile={isMobile}
              intensity={1 - openingProgress * 0.35}
            />
          </ClientErrorBoundary>
        )}

        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-100 will-change-transform"
          style={{
            transform: `translateY(${Math.sin(progress * Math.PI) * -8}px) scale(${1 + progress * 0.04})`,
            opacity: showLogo ? Math.max(0.15, 1 - revealProgress * 1.1) : 1,
          }}
        >
          <KeepsakeBoxVisual
            lidLift={openingProgress}
            glowIntensity={openingProgress}
            className="mt-[-4vh]"
          />

          {ribbonVisible && (
            <RibbonKnot
              progress={untyingProgress}
              className={cn(untyingProgress > 0.8 && "opacity-60")}
            />
          )}
        </div>

        <TreasureParticles progress={progress} mobile={isMobile} />

        {showLogo && (
          <div
            className="absolute inset-x-0 top-[14%] z-20 flex justify-center px-4 transition-opacity duration-500 md:top-[16%]"
            style={{ opacity: Math.min(1, revealProgress * 1.6) }}
          >
            <div
              className="absolute -inset-x-4 -inset-y-8 rounded-sm border border-champagne/35 bg-gradient-to-br from-cotton via-ivory to-linen shadow-luxury-lg md:-inset-x-10 md:-inset-y-10"
              style={{
                opacity: revealProgress * 0.95,
                transform: `scale(${0.9 + revealProgress * 0.1})`,
              }}
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(201,147,47,0.1) 4px, rgba(201,147,47,0.1) 5px)",
                }}
              />
            </div>

            <div className="relative flex flex-col items-center px-6 py-8 md:px-10 md:py-10">
              <div
                className="absolute inset-0 scale-150 rounded-full bg-champagne/30 blur-3xl"
                style={{ opacity: revealProgress * 0.8 }}
              />
              <AnimatedLogo
                variant="full"
                size={logoSize}
                playEntrance
                showTagline={revealProgress > 0.55}
                priority
                className="relative drop-shadow-[0_0_32px_rgba(201,147,47,0.5)]"
              />
            </div>
          </div>
        )}

        <IntroChapterText progress={progress} />
        <SilkTransformation progress={progress} />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(201,147,47,0.25) 0%, transparent 65%)",
            opacity: openingProgress * 0.75,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
