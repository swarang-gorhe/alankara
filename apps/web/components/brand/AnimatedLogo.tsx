"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TAGLINE = "Crafted for little moments.";

const PETAL_COUNT = 6;
const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

type AnimatedLogoProps = {
  size?: number;
  className?: string;
  /** Show script tagline beneath the medallion */
  showTagline?: boolean;
  /** Brief idle micro-rotate every ~20s when in view */
  idlePulse?: boolean;
  /** Run full entrance sequence on mount */
  playEntrance?: boolean;
};

export function AnimatedLogo({
  size = 100,
  className,
  showTagline = false,
  idlePulse = false,
  playEntrance = true,
}: AnimatedLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [idleKey, setIdleKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [entranceDone, setEntranceDone] = useState(!playEntrance);

  const { scrollY } = useScroll();
  const floatY = useTransform(scrollY, [0, 600], [0, prefersReducedMotion ? 0 : -12]);
  const smoothFloatY = useSpring(floatY, { stiffness: 120, damping: 28 });

  const hoverSpread = useMotionValue(1);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!idlePulse || prefersReducedMotion || !isInView) return;

    const interval = setInterval(() => {
      setIdleKey((k) => k + 1);
    }, 20000);

    return () => clearInterval(interval);
  }, [idlePulse, prefersReducedMotion, isInView]);

  useEffect(() => {
    hoverSpread.set(isHovered && !prefersReducedMotion ? 1.14 : 1);
  }, [isHovered, hoverSpread, prefersReducedMotion]);

  const reduced = prefersReducedMotion === true;

  const spinTransition = reduced
    ? { duration: 0.6, ease: "easeOut" as const }
    : { duration: 1.4, ease: LUXURY_EASE };

  const idleRotate = idlePulse && isInView && !reduced ? (idleKey % 2 === 0 ? 4 : -4) : 0;

  return (
    <div
      ref={containerRef}
      className={cn("inline-flex flex-col items-center", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative inline-flex items-center justify-center"
        style={{ y: smoothFloatY, width: size, height: size }}
        initial={playEntrance && !reduced ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.5 : 0.3, ease: LUXURY_EASE }}
      >
        {/* Sequential petal bloom rings */}
        {!reduced &&
          Array.from({ length: PETAL_COUNT }).map((_, index) => (
            <motion.span
              key={`petal-${index}`}
              className="pointer-events-none absolute rounded-full border border-champagne/30"
              style={{
                width: size * (0.55 + index * 0.12),
                height: size * (0.55 + index * 0.12),
              }}
              initial={playEntrance ? { scale: 0.5, opacity: 0 } : false}
              animate={{
                scale: isHovered ? 1.08 + index * 0.04 : 1,
                opacity: isHovered ? 0.35 - index * 0.04 : 0.2 - index * 0.025,
              }}
              transition={{
                delay: playEntrance ? 0.15 + index * 0.1 : 0,
                duration: 0.9,
                ease: LUXURY_EASE,
              }}
              aria-hidden="true"
            />
          ))}

        <motion.div
          key={idlePulse ? `idle-${idleKey}` : "logo-spin"}
          className="relative z-10"
          initial={playEntrance && !reduced ? { rotate: 0 } : false}
          animate={{
            rotate: reduced ? 0 : playEntrance && !entranceDone ? 360 : idleRotate,
          }}
          transition={
            playEntrance && !entranceDone && !reduced
              ? spinTransition
              : { duration: 0.8, ease: LUXURY_EASE }
          }
          onAnimationComplete={() => {
            if (playEntrance && !entranceDone) setEntranceDone(true);
          }}
          aria-hidden="true"
        >
          <motion.div
            animate={
              reduced
                ? { filter: "drop-shadow(0 0 0 rgba(201,147,47,0))" }
                : {
                    filter: isHovered
                      ? "drop-shadow(0 0 32px rgba(201,147,47,0.65))"
                      : "drop-shadow(0 0 20px rgba(201,147,47,0.45))",
                  }
            }
            transition={{ duration: 0.9, ease: LUXURY_EASE, delay: reduced ? 0 : 0.4 }}
          >
            <Image
              src="/brand/logo.svg"
              alt=""
              width={size}
              height={size}
              priority
              className="object-contain transition-transform duration-base ease-luxury"
              style={{
                width: size,
                height: size,
                transform: isHovered && !reduced ? "scale(1.06)" : "scale(1)",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {showTagline && (
        <motion.p
          className="mt-4 max-w-xs text-center font-script text-lg text-warm-brown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduced ? 0.5 : 0.7,
            delay: reduced ? 0.1 : 0.2,
            ease: LUXURY_EASE,
          }}
        >
          {TAGLINE}
        </motion.p>
      )}
    </div>
  );
}

/** Default showcase size — ~250% of the 40px header logo */
export const LOGO_SHOWCASE_SIZE = 100;
