"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export const LOGO_FULL_SRC = "/brand/logo-full.png";
/** Flower emblem only — favicon, wax seal, tiny chrome. */
export const LOGO_MARK_SRC = "/brand/logo-mark.png";

type AnimatedLogoProps = {
  size?: number;
  className?: string;
  /** `full` = circular lockup everywhere; `mark` = emblem only for tiny UI */
  variant?: "mark" | "full";
  /** Ignored for the full lockup (tagline is in the artwork). Kept for mark moments. */
  showTagline?: boolean;
  idlePulse?: boolean;
  playEntrance?: boolean;
  priority?: boolean;
};

export function AnimatedLogo({
  size = 100,
  className,
  variant = "full",
  showTagline = false,
  idlePulse = false,
  playEntrance = true,
  priority = false,
}: AnimatedLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [idleFlourish, setIdleFlourish] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [entranceDone, setEntranceDone] = useState(!playEntrance);

  const { scrollY } = useScroll();
  const floatY = useTransform(scrollY, [0, 600], [0, prefersReducedMotion ? 0 : -8]);
  const smoothFloatY = useSpring(floatY, { stiffness: 120, damping: 28 });

  const isFull = variant === "full";
  const src = isFull ? LOGO_FULL_SRC : LOGO_MARK_SRC;
  // Lockup is square; mark is square too.
  const imageSize = size;

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
    if (!idlePulse || prefersReducedMotion || !isInView || isFull) return;
    const interval = setInterval(() => setIdleFlourish(true), 20000);
    return () => clearInterval(interval);
  }, [idlePulse, prefersReducedMotion, isInView, isFull]);

  const reduced = prefersReducedMotion === true;

  // Full lockup never spins — the lettering would read upside-down mid-turn.
  const logoRotate = (() => {
    if (reduced || isFull) return 0;
    if (playEntrance && !entranceDone) return [0, 360];
    if (idleFlourish) return [0, 12, -6, 0];
    return 0;
  })();

  const logoTransition = (() => {
    if (isFull) return { duration: 0 };
    if (playEntrance && !entranceDone && !reduced) {
      return { duration: 1.4, ease: LUXURY_EASE };
    }
    if (idleFlourish && !reduced) return { duration: 1.2, ease: LUXURY_EASE };
    return { duration: 0 };
  })();

  return (
    <div
      ref={containerRef}
      className={cn("inline-flex flex-col items-center", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative inline-flex items-center justify-center"
        style={{ y: smoothFloatY, width: imageSize, height: imageSize }}
        initial={playEntrance && !reduced ? { opacity: 0, scale: 0.94 } : false}
        animate={{ opacity: 1, scale: isHovered && !reduced ? 1.03 : 1 }}
        transition={{ duration: reduced ? 0.4 : 0.55, ease: LUXURY_EASE }}
      >
        <motion.div
          className="relative z-10"
          style={{ transformOrigin: "center center" }}
          animate={{ rotate: logoRotate }}
          transition={logoTransition}
          onAnimationComplete={() => {
            if (playEntrance && !entranceDone) setEntranceDone(true);
            if (idleFlourish) setIdleFlourish(false);
          }}
        >
          <Image
            src={src}
            alt="Alankara"
            width={imageSize}
            height={imageSize}
            priority={priority}
            className="object-contain"
            style={{ width: imageSize, height: imageSize }}
            sizes={`${imageSize}px`}
          />
        </motion.div>
      </motion.div>

      {showTagline && !isFull && (
        <motion.p
          className="mt-4 max-w-xs text-center font-script text-lg text-warm-brown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.4 : 0.6, ease: LUXURY_EASE }}
        >
          Crafted for little moments.
        </motion.p>
      )}
    </div>
  );
}

export const LOGO_SHOWCASE_SIZE = 160;
export const LOGO_INTRO_DESKTOP_SIZE = 180;
