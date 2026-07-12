"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
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
  const [show3D, setShow3D] = useState(true);
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
    if (prefersReducedMotion) return;
    const perfCheck = window.setTimeout(() => {
      const nav = navigator as Navigator & { deviceMemory?: number };
      if (nav.deviceMemory && nav.deviceMemory < 4) {
        setShow3D(false);
      }
    }, 100);
    return () => window.clearTimeout(perfCheck);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  const ribbonVisible = untyingProgress < 1 || progress < INTRO_CHAPTER_BREAKS.openingEnd;
  const showLogo = revealProgress > 0.15;

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
          className="absolute inset-0 bg-gradient-to-b from-ivory via-linen to-cotton/60"
          aria-hidden="true"
        />

        {show3D && (
          <ClientErrorBoundary fallback={null}>
            <IntroAtmosphere3D
              className="absolute inset-0 opacity-80"
              mobile={isMobile}
              intensity={1 - openingProgress * 0.3}
            />
          </ClientErrorBoundary>
        )}

        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-100 will-change-transform"
          style={{
            transform: `translateY(${Math.sin(progress * Math.PI) * -8}px) scale(${1 + progress * 0.04})`,
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
            className="absolute inset-x-0 top-[22%] z-20 flex justify-center transition-opacity duration-500"
            style={{ opacity: Math.min(1, revealProgress * 1.5) }}
          >
            {/* Gold-foil paper insert */}
            <div
              className="absolute -inset-x-8 -inset-y-6 rounded-sm border border-champagne/30 bg-gradient-to-br from-cotton via-ivory to-linen shadow-luxury-lg"
              style={{
                opacity: revealProgress * 0.95,
                transform: `scale(${0.92 + revealProgress * 0.08})`,
              }}
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(201,147,47,0.08) 4px, rgba(201,147,47,0.08) 5px)",
                }}
              />
            </div>
            <div className="relative px-8 py-6">
              <div
                className="absolute inset-0 scale-150 rounded-full bg-champagne/25 blur-3xl"
                style={{ opacity: revealProgress }}
              />
              <AnimatedLogo
                size={isMobile ? 120 : 150}
                playEntrance
                showTagline={revealProgress > 0.6}
                className="relative drop-shadow-[0_0_28px_rgba(201,147,47,0.45)]"
              />
            </div>
          </div>
        )}

        <IntroChapterText progress={progress} />
        <SilkTransformation progress={progress} />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(201,147,47,0.2) 0%, transparent 65%)",
            opacity: openingProgress * 0.7,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
