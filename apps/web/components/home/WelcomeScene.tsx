"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";
import { ClientErrorBoundary } from "@/components/ui/ClientErrorBoundary";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const WelcomeHero3D = dynamic(() => import("./WelcomeHero3D").then((mod) => mod.WelcomeHero3D), {
  ssr: false,
  loading: () => <WelcomeHeroFallback />,
});

function WelcomeHeroFallback() {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-b from-cream-light via-cream to-olive-linen/30"
      aria-hidden="true"
    />
  );
}

export function WelcomeScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const isMobile = useIsMobile();
  const show3D = !prefersReducedMotion && !isTouch && !isMobile;

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(glowRef.current, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.8 })
        .fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.5, filter: "blur(12px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.4 },
          "-=1.2",
        )
        .fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, "-=0.6")
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5",
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24"
      aria-label="Welcome"
    >
      {!show3D && <WelcomeHeroFallback />}

      {show3D && (
        <ClientErrorBoundary fallback={<WelcomeHeroFallback />}>
          <WelcomeHero3D className="absolute inset-0 h-full w-full opacity-90" />
        </ClientErrorBoundary>
      )}

      <div
        ref={glowRef}
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-gold/20 blur-3xl"
        style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          ref={logoRef}
          className={cn(
            "relative mb-8",
            prefersReducedMotion ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="absolute inset-0 scale-150 rounded-full bg-gold-bright/20 blur-2xl" />
          <AnimatedLogo size={120} className="relative drop-shadow-[0_0_24px_rgba(201,147,47,0.45)]" />
        </div>

        <h1
          ref={titleRef}
          className={cn(
            "max-w-3xl font-display text-3xl leading-tight text-maroon sm:text-4xl md:text-6xl lg:text-7xl",
            prefersReducedMotion ? "opacity-100" : "opacity-0",
          )}
        >
          Alankara
        </h1>

        <p
          ref={subtitleRef}
          className={cn(
            "mt-4 max-w-md font-script text-lg italic text-gold sm:mt-6 sm:text-xl md:text-2xl",
            prefersReducedMotion ? "opacity-100" : "opacity-0",
          )}
        >
          Heirloom adornments, woven by hand
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-charcoal-muted">
        <span className="text-xs uppercase tracking-[0.3em]">Scroll to discover</span>
        <Image
          src="/brand/logo.svg"
          alt=""
          width={16}
          height={16}
          className="motion-reduce:animate-none animate-bounce opacity-40"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
