"use client";

import { useEffect, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsap } from "@/lib/gsap";

type RevealVariant = "fade-up" | "clip-up" | "mask-left" | "parallax" | "scale-in";

type UseChapterRevealOptions = {
  trigger?: RefObject<HTMLElement | null>;
  targets?: RefObject<HTMLElement | null>;
  variant?: RevealVariant;
  start?: string;
  delay?: number;
  stagger?: number;
};

export function useChapterReveal({
  trigger,
  targets,
  variant = "fade-up",
  start = "top 80%",
  delay = 0,
  stagger = 0.12,
}: UseChapterRevealOptions) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    const triggerEl = trigger?.current;
    const targetEl = targets?.current;
    if (!triggerEl || !targetEl || prefersReducedMotion) return;

    const children = targetEl.querySelectorAll("[data-reveal]");

    const fromVars: Record<string, unknown> = { opacity: 0 };
    const toVars: Record<string, unknown> = { opacity: 1, duration: 1, ease: "power3.out", delay };

    switch (variant) {
      case "clip-up":
        fromVars.clipPath = "inset(100% 0 0 0)";
        toVars.clipPath = "inset(0% 0 0 0)";
        break;
      case "mask-left":
        fromVars.x = -60;
        fromVars.clipPath = "inset(0 100% 0 0)";
        toVars.x = 0;
        toVars.clipPath = "inset(0 0% 0 0)";
        break;
      case "parallax":
        fromVars.y = 80;
        toVars.y = 0;
        break;
      case "scale-in":
        fromVars.scale = 0.92;
        toVars.scale = 1;
        break;
      default:
        fromVars.y = 48;
        toVars.y = 0;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(children.length ? children : targetEl, fromVars, {
        ...toVars,
        stagger: children.length ? stagger : 0,
        scrollTrigger: {
          trigger: triggerEl,
          start,
          toggleActions: "play none none reverse",
        },
      });
    }, triggerEl);

    return () => ctx.revert();
  }, [trigger, targets, variant, start, delay, stagger, prefersReducedMotion]);
}
