"use client";

import { useEffect, useRef, useState } from "react";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type LuxuryCursorProviderProps = {
  children: React.ReactNode;
};

export function LuxuryCursorProvider({ children }: LuxuryCursorProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const magneticTarget = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number>(0);

  const active = enabled && !prefersReducedMotion && !isTouch;

  useEffect(() => {
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!active) {
      document.body.classList.remove("luxury-cursor-active");
      return;
    }

    document.body.classList.add("luxury-cursor-active");

    const onMove = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };

      const el = document.elementFromPoint(event.clientX, event.clientY);
      const magnetic = el?.closest("[data-magnetic]") as HTMLElement | null;
      magneticTarget.current = magnetic;

      const hoverable = el?.closest("a, button, [data-cursor-sparkle]");
      if (sparkleRef.current) {
        sparkleRef.current.style.opacity = hoverable ? "1" : "0";
      }
    };

    const animate = () => {
      const lerp = magneticTarget.current ? 0.18 : 0.12;
      position.current.x += (target.current.x - position.current.x) * lerp;
      position.current.y += (target.current.y - position.current.y) * lerp;

      let offsetX = 0;
      let offsetY = 0;
      if (magneticTarget.current) {
        const rect = magneticTarget.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        offsetX = (centerX - position.current.x) * 0.35;
        offsetY = (centerY - position.current.y) * 0.35;
      }

      const x = position.current.x + offsetX;
      const y = position.current.y + offsetY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      if (sparkleRef.current) {
        sparkleRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frameRef.current);
      document.body.classList.remove("luxury-cursor-active");
    };
  }, [active]);

  return (
    <>
      {children}
      {active && (
        <>
          <div
            ref={spotlightRef}
            className="pointer-events-none fixed left-0 top-0 z-[9998] h-48 w-48 rounded-full bg-gold/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            ref={cursorRef}
            className={cn(
              "pointer-events-none fixed left-0 top-0 z-[9999] h-3 w-3 rounded-full",
              "border border-gold-bright/80 bg-cream-light/20 backdrop-blur-sm",
              "shadow-[0_0_12px_rgba(201,147,47,0.5)]",
            )}
            aria-hidden="true"
          />
          <div
            ref={sparkleRef}
            className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 transition-opacity duration-200"
            aria-hidden="true"
          >
            <span className="absolute -left-1 -top-1 h-1 w-1 rounded-full bg-gold-bright" />
            <span className="absolute left-2 top-0 h-0.5 w-0.5 rounded-full bg-gold" />
            <span className="absolute -left-0.5 top-2 h-0.5 w-0.5 rounded-full bg-gold-bright" />
          </div>
        </>
      )}
    </>
  );
}
