"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { getObjectCoverTransform, landmarkToBox } from "./coverMapping";
import type { EarAnchors, TryOnProduct } from "./types";

type EarringOverlayCanvasProps = {
  width: number;
  height: number;
  /** Intrinsic media size used for object-cover mapping (videoWidth/Height or natural). */
  mediaWidth?: number;
  mediaHeight?: number;
  anchors: EarAnchors | null;
  product: TryOnProduct;
  showOverlay?: boolean;
  mirrored?: boolean;
  className?: string;
  /** When set, parent can call this to force a redraw without React state. */
  drawRef?: MutableRefObject<((anchors: EarAnchors | null) => void) | null>;
};

function assetUrl(product: TryOnProduct): string | null {
  return product.tryOnAssetUrl || product.images[0] || null;
}

export function EarringOverlayCanvas({
  width,
  height,
  mediaWidth,
  mediaHeight,
  anchors,
  product,
  showOverlay = true,
  mirrored = true,
  className,
  drawRef,
}: EarringOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const anchorsRef = useRef<EarAnchors | null>(anchors);
  const url = assetUrl(product);

  useEffect(() => {
    anchorsRef.current = anchors;
  }, [anchors]);

  useEffect(() => {
    if (!url) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
    imgRef.current = img;
    img.onload = () => {
      paint(anchorsRef.current);
    };
  }, [url]);

  const paint = (next: EarAnchors | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (!showOverlay || !next || !imgRef.current) return;
    const img = imgRef.current;
    if (!img.complete || img.naturalWidth === 0) return;

    const mw = mediaWidth && mediaWidth > 0 ? mediaWidth : width;
    const mh = mediaHeight && mediaHeight > 0 ? mediaHeight : height;
    const cover = getObjectCoverTransform(mw, mh, width, height);

    const baseW = Math.max(18, next.scale * width * 0.095);
    const aspect = img.naturalHeight / Math.max(1, img.naturalWidth);
    const baseH = baseW * aspect;

    const drawSide = (side: "left" | "right") => {
      const ear = next[side];
      if (!ear.visible) return;

      // Soft fade when head turns away
      const depthFade =
        side === "left"
          ? Math.max(0.25, 1 - Math.max(0, -next.yaw) * 0.55)
          : Math.max(0.25, 1 - Math.max(0, next.yaw) * 0.55);
      const depthScale =
        side === "left" ? 1 - next.yaw * 0.18 : 1 + next.yaw * 0.18;
      const w = baseW * Math.max(0.55, depthScale);
      const h = baseH * Math.max(0.55, depthScale);

      const mapped = landmarkToBox(ear.x, ear.y, cover);
      const cx = mirrored ? width - mapped.x : mapped.x;
      const cy = mapped.y;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mirrored ? -next.roll : next.roll);
      // Mirror each earring so the ornament faces outward naturally on selfie view
      if ((side === "left" && mirrored) || (side === "right" && !mirrored)) {
        ctx.scale(-1, 1);
      }
      ctx.globalAlpha = 0.92 * depthFade;
      // Soft shadow under jewel for depth
      ctx.shadowColor = "rgba(43,35,28,0.28)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      // Hang from top-center of asset (hook point)
      ctx.drawImage(img, -w / 2, -h * 0.08, w, h);
      ctx.restore();
    };

    drawSide("left");
    drawSide("right");
  };

  useEffect(() => {
    if (drawRef) {
      drawRef.current = (a) => {
        anchorsRef.current = a;
        paint(a);
      };
    }
    paint(anchors);
    return () => {
      if (drawRef) drawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, mediaWidth, mediaHeight, product, showOverlay, mirrored, url, drawRef]);

  useEffect(() => {
    paint(anchors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchors]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
      aria-hidden
    />
  );
}
