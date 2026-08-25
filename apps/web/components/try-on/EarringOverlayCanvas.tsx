"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { getObjectCoverTransform, landmarkToBox } from "./coverMapping";
import {
  computeAlphaBounds,
  getTryOnAssetUrl,
  getTryOnKind,
  type TrimBounds,
} from "./tryOnAsset";
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
  const trimRef = useRef<TrimBounds | null>(null);
  const anchorsRef = useRef<EarAnchors | null>(anchors);
  const url = getTryOnAssetUrl(product);
  const kind = getTryOnKind(product);

  useEffect(() => {
    anchorsRef.current = anchors;
  }, [anchors]);

  useEffect(() => {
    if (!url) {
      imgRef.current = null;
      trimRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
    imgRef.current = img;
    img.onload = () => {
      trimRef.current = computeAlphaBounds(img);
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

    const trim =
      trimRef.current ?? {
        sx: 0,
        sy: 0,
        sw: img.naturalWidth,
        sh: img.naturalHeight,
      };

    const mw = mediaWidth && mediaWidth > 0 ? mediaWidth : width;
    const mh = mediaHeight && mediaHeight > 0 ? mediaHeight : height;
    const cover = getObjectCoverTransform(mw, mh, width, height);
    const aspect = trim.sh / Math.max(1, trim.sw);

    if (kind === "necklace" || next.kind === "necklace") {
      paintNecklace(ctx, img, trim, next, cover, aspect, mirrored, width);
      return;
    }

    paintEarrings(ctx, img, trim, next, cover, aspect, mirrored, width);
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
  }, [width, height, mediaWidth, mediaHeight, product, showOverlay, mirrored, url, kind, drawRef]);

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

function paintEarrings(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  trim: TrimBounds,
  next: EarAnchors,
  cover: ReturnType<typeof getObjectCoverTransform>,
  aspect: number,
  mirrored: boolean,
  width: number,
) {
  // Slightly smaller than face so cloth drops feel true to life
  const baseW = Math.max(16, next.scale * width * 0.078);
  const baseH = baseW * aspect;

  const drawSide = (side: "left" | "right") => {
    const ear = next[side];
    if (!ear.visible) return;

    const depthFade =
      side === "left"
        ? Math.max(0.35, 1 - Math.max(0, -next.yaw) * 0.65)
        : Math.max(0.35, 1 - Math.max(0, next.yaw) * 0.65);
    // Perspective: far ear compresses in X
    const depthScaleX =
      side === "left" ? 1 - next.yaw * 0.28 : 1 + next.yaw * 0.28;
    const depthScaleY =
      side === "left" ? 1 - next.yaw * 0.08 : 1 + next.yaw * 0.08;
    const w = baseW * Math.max(0.5, Math.abs(depthScaleX));
    const h = baseH * Math.max(0.55, depthScaleY);

    const mapped = landmarkToBox(ear.x, ear.y, cover);
    const cx = mirrored ? width - mapped.x : mapped.x;
    const cy = mapped.y;

    // Subtle hang sway from head roll
    const sway = Math.sin(next.roll * 2.2) * (h * 0.012);

    ctx.save();
    ctx.translate(cx + sway, cy);
    ctx.rotate(mirrored ? -next.roll * 0.85 : next.roll * 0.85);
    // Mirror so each earring faces outward on selfie view
    if ((side === "left" && mirrored) || (side === "right" && !mirrored)) {
      ctx.scale(-1, 1);
    }
    // Compress far side for 3D feel
    ctx.scale(Math.sign(depthScaleX) || 1, 1);

    ctx.globalAlpha = 0.96 * depthFade;
    ctx.shadowColor = "rgba(35, 28, 22, 0.38)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.shadowOffsetX = side === "left" ? -1 : 1;

    // Soft contact shadow under the piece
    ctx.fillStyle = "rgba(40, 30, 22, 0.12)";
    ctx.beginPath();
    ctx.ellipse(0, h * 0.92, w * 0.28, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "rgba(35, 28, 22, 0.32)";
    // Hang from ear-wire at top of trimmed cutout
    ctx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, -w / 2, 0, w, h);

    // Soft fabric multiply wash so it sits on skin rather than floating
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.12 * depthFade;
    ctx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, -w / 2, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    ctx.restore();
  };

  drawSide("left");
  drawSide("right");
}

function paintNecklace(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  trim: TrimBounds,
  next: EarAnchors,
  cover: ReturnType<typeof getObjectCoverTransform>,
  aspect: number,
  mirrored: boolean,
  width: number,
) {
  const mapped = landmarkToBox(next.centerX, next.centerY, cover);
  const cx = mirrored ? width - mapped.x : mapped.x;
  const cy = mapped.y;

  const left = landmarkToBox(next.left.x, next.left.y, cover);
  const right = landmarkToBox(next.right.x, next.right.y, cover);
  const span = Math.abs((mirrored ? width - left.x : left.x) - (mirrored ? width - right.x : right.x));
  const neckW = Math.max(span * 1.05, next.neckWidth * width * 0.9, 80);
  const neckH = neckW * aspect * 0.85;

  const depthFade = Math.max(0.55, 1 - Math.abs(next.yaw) * 0.35);
  const perspX = 1 - Math.abs(next.yaw) * 0.18;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(mirrored ? -next.roll * 0.5 : next.roll * 0.5);
  ctx.scale(perspX, 1);
  ctx.globalAlpha = 0.94 * depthFade;
  ctx.shadowColor = "rgba(35, 28, 22, 0.35)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.drawImage(
    img,
    trim.sx,
    trim.sy,
    trim.sw,
    trim.sh,
    -neckW / 2,
    -neckH * 0.15,
    neckW,
    neckH,
  );
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.1 * depthFade;
  ctx.drawImage(
    img,
    trim.sx,
    trim.sy,
    trim.sw,
    trim.sh,
    -neckW / 2,
    -neckH * 0.15,
    neckW,
    neckH,
  );
  ctx.restore();
}
