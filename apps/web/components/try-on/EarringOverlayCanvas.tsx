"use client";

import { useEffect, useRef } from "react";
import type { EarAnchors, TryOnProduct } from "./types";

type EarringOverlayCanvasProps = {
  width: number;
  height: number;
  anchors: EarAnchors | null;
  product: TryOnProduct;
  showOverlay?: boolean;
  className?: string;
};

function assetUrl(product: TryOnProduct): string | null {
  return product.tryOnAssetUrl || product.images[0] || null;
}

export function EarringOverlayCanvas({
  width,
  height,
  anchors,
  product,
  showOverlay = true,
  className,
}: EarringOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const url = assetUrl(product);

  useEffect(() => {
    if (!url) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    imgRef.current = img;
  }, [url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    if (!showOverlay || !anchors || !imgRef.current?.complete) return;

    const img = imgRef.current;
    const baseW = Math.max(24, anchors.scale * width * 0.12);
    const aspect = img.naturalHeight / Math.max(1, img.naturalWidth);
    const baseH = baseW * aspect;

    const drawSide = (side: "left" | "right") => {
      const ear = anchors[side];
      if (!ear.visible) return;
      const cx = ear.x * width;
      const cy = ear.y * height;
      // Perspective: shrink the far ear slightly by yaw
      const depthScale = side === "left" ? 1 - anchors.yaw * 0.25 : 1 + anchors.yaw * 0.25;
      const w = baseW * Math.max(0.55, depthScale);
      const h = baseH * Math.max(0.55, depthScale);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(anchors.roll);
      if (side === "left") ctx.scale(-1, 1);
      ctx.globalAlpha = 0.96;
      ctx.drawImage(img, -w / 2, 0, w, h);
      ctx.restore();
    };

    drawSide("left");
    drawSide("right");
  }, [anchors, height, product, showOverlay, url, width]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
      aria-hidden
    />
  );
}
