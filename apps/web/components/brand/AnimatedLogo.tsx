"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AnimatedLogoProps = {
  size?: number;
  className?: string;
  /** Brief idle micro-rotate every 20s (navbar) */
  idlePulse?: boolean;
};

export function AnimatedLogo({ size = 48, className, idlePulse = false }: AnimatedLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const [idleKey, setIdleKey] = useState(0);

  useEffect(() => {
    if (!idlePulse || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIdleKey((k) => k + 1);
    }, 20000);

    return () => clearInterval(interval);
  }, [idlePulse, prefersReducedMotion]);

  const spinTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1.4, ease: "easeOut" as const };

  return (
    <motion.div
      key={idlePulse ? `idle-${idleKey}` : "load"}
      className={cn("relative inline-flex items-center justify-center", className)}
      initial={{ rotate: 0 }}
      animate={{ rotate: prefersReducedMotion ? 0 : 360 }}
      transition={spinTransition}
      aria-hidden="true"
    >
      <Image
        src="/brand/logo.svg"
        alt="Alankara medallion"
        width={size}
        height={size}
        priority
        className="object-contain"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
}
