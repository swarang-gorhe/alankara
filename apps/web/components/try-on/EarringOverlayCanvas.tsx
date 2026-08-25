"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { getObjectCoverTransform, landmarkToBox } from "./coverMapping";
import {
  computeAlphaBounds,
  getTryOnAssetUrl,
  getTryOnKind,
  type TrimBounds,
} from "./tryOnAsset";
import { lastEarAnchorDebug } from "./useEarAnchors";
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

const DEV = process.env.NODE_ENV === "development";
/** Width as fraction of detected interocular span (px) — cloth drops ~30–34% */
const EARRING_IO_RATIO = 0.32;
const NECKLACE_IO_RATIO = 0.92;

type SceneSample = { r: number; g: number; b: number; lum: number };

const sampleCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
const sampleCtx = sampleCanvas?.getContext("2d", { willReadFrequently: true }) ?? null;

function findMediaElement(canvas: HTMLCanvasElement): HTMLVideoElement | HTMLImageElement | null {
  const root = canvas.parentElement;
  if (!root) return null;
  const video = root.querySelector("video");
  if (video && video.readyState >= 2) return video;
  const img = root.querySelector('img[alt*="try-on"], img[alt*="photo"]');
  return img instanceof HTMLImageElement && img.complete ? img : null;
}

function sampleSceneNear(
  media: HTMLVideoElement | HTMLImageElement,
  nx: number,
  ny: number,
): SceneSample {
  const fallback = { r: 120, g: 100, b: 90, lum: 0.35 };
  if (!sampleCanvas || !sampleCtx) return fallback;

  const mw =
    media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
  const mh =
    media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
  if (!mw || !mh) return fallback;

  const cx = Math.max(8, Math.min(mw - 8, Math.floor(nx * mw)));
  const cy = Math.max(8, Math.min(mh - 8, Math.floor(ny * mh)));
  const size = 24;
  sampleCanvas.width = size;
  sampleCanvas.height = size;

  try {
    sampleCtx.drawImage(
      media,
      cx - size / 2,
      cy - size / 2,
      size,
      size,
      0,
      0,
      size,
      size,
    );
    const { data } = sampleCtx.getImageData(0, 0, size, size);
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n += 1;
    }
    if (!n) return fallback;
    r /= n;
    g /= n;
    b /= n;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return { r, g, b, lum };
  } catch {
    return fallback;
  }
}

function buildFeatheredAsset(
  img: HTMLImageElement,
  trim: TrimBounds,
  blurPx = 1.4,
): HTMLCanvasElement {
  const pad = Math.ceil(blurPx * 2);
  const w = trim.sw + pad * 2;
  const h = trim.sh + pad * 2;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.filter = `blur(${blurPx}px)`;
  ctx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, pad, pad, trim.sw, trim.sh);
  ctx.filter = "none";
  return c;
}

function sceneColorGrade(sample: SceneSample): string {
  const warmth = sample.r / Math.max(1, sample.b) - 1;
  const bright = 0.55 + sample.lum * 0.75;
  const sat = 0.82 + sample.lum * 0.18;
  const sepia = Math.min(0.35, Math.max(0, warmth * 0.12));
  return `brightness(${bright.toFixed(2)}) saturate(${sat.toFixed(2)}) sepia(${sepia.toFixed(2)})`;
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
  const trimRef = useRef<TrimBounds | null>(null);
  const featherRef = useRef<HTMLCanvasElement | null>(null);
  const featherPadRef = useRef(0);
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
      featherRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
    imgRef.current = img;
    img.onload = () => {
      const trim = computeAlphaBounds(img);
      trimRef.current = trim;
      if (trim) {
        const blurPx = 1.4;
        featherRef.current = buildFeatheredAsset(img, trim, blurPx);
        featherPadRef.current = Math.ceil(blurPx * 2);
      }
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
    const mediaEl = findMediaElement(canvas);

    if (kind === "necklace" || next.kind === "necklace") {
      paintNecklace(ctx, img, trim, next, cover, aspect, mirrored, width, mediaEl);
    } else {
      paintEarrings(
        ctx,
        img,
        trim,
        next,
        cover,
        aspect,
        mirrored,
        width,
        mediaEl,
        featherRef.current,
        featherPadRef.current,
      );
    }

    if (DEV) {
      drawAnchorDebug(ctx, next, cover, mirrored, width);
    }
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

function drawFeathered(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  trim: TrimBounds,
  feather: HTMLCanvasElement | null,
  pad: number,
  dx: number,
  dy: number,
  w: number,
  h: number,
) {
  if (feather && pad > 0) {
    ctx.drawImage(feather, dx - pad, dy - pad, w + pad * 2, h + pad * 2);
    return;
  }
  ctx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, dx, dy, w, h);
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
  mediaEl: HTMLVideoElement | HTMLImageElement | null,
  feather?: HTMLCanvasElement | null,
  featherPad?: number,
) {
  const eyeSpanPx = next.interocular * cover.drawW;
  const baseW = eyeSpanPx * EARRING_IO_RATIO * next.scale;
  const baseH = baseW * aspect;

  const drawSide = (side: "left" | "right", order: number) => {
    const ear = next[side];
    if (!ear.visible) return;

    const depthFade =
      side === "left"
        ? Math.max(0.2, 1 - Math.max(0, -next.yaw) * 0.75)
        : Math.max(0.2, 1 - Math.max(0, next.yaw) * 0.75);
    const depthScaleX =
      side === "left" ? 1 - next.yaw * 0.32 : 1 + next.yaw * 0.32;
    const depthScaleY =
      side === "left" ? 1 - next.yaw * 0.1 : 1 + next.yaw * 0.1;
    const w = baseW * Math.max(0.45, Math.abs(depthScaleX));
    const h = baseH * Math.max(0.5, depthScaleY);

    const mapped = landmarkToBox(ear.x, ear.y, cover);
    const cx = mirrored ? width - mapped.x : mapped.x;
    const cy = mapped.y;

    const scene = mediaEl
      ? sampleSceneNear(mediaEl, ear.x, ear.y)
      : { r: 120, g: 100, b: 90, lum: 0.35 };
    const shadowAlpha = Math.min(0.42, 0.12 + scene.lum * 0.28);
    const sway = Math.sin(next.roll * 2.2 + order) * (h * 0.01);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(cx + sway, cy);
    ctx.rotate(mirrored ? -next.roll * 0.82 : next.roll * 0.82);
    if ((side === "left" && mirrored) || (side === "right" && !mirrored)) {
      ctx.scale(-1, 1);
    }
    ctx.scale(Math.sign(depthScaleX) || 1, 1);

    // Drop shadow — stronger in bright scenes, softer in low light
    ctx.globalAlpha = shadowAlpha * depthFade;
    ctx.fillStyle = "rgba(18, 12, 8, 0.85)";
    ctx.filter = "blur(4px)";
    ctx.beginPath();
    ctx.ellipse(0, h * 0.94, w * 0.22, h * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = "none";

    ctx.globalAlpha = 0.97 * depthFade;
    ctx.filter = sceneColorGrade(scene);
    drawFeathered(
      ctx,
      img,
      trim,
      feather ?? null,
      featherPad ?? 0,
      -w / 2,
      0,
      w,
      h,
    );
    ctx.filter = "none";

    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = (0.08 + scene.lum * 0.06) * depthFade;
    drawFeathered(
      ctx,
      img,
      trim,
      feather ?? null,
      featherPad ?? 0,
      -w / 2,
      0,
      w,
      h,
    );
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  };

  // Far ear first, near ear on top — basic depth ordering
  if (next.yaw >= 0) {
    drawSide("left", 0);
    drawSide("right", 1);
  } else {
    drawSide("right", 0);
    drawSide("left", 1);
  }
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
  mediaEl: HTMLVideoElement | HTMLImageElement | null,
) {
  const mapped = landmarkToBox(next.centerX, next.centerY, cover);
  const cx = mirrored ? width - mapped.x : mapped.x;
  const cy = mapped.y;

  const left = landmarkToBox(next.left.x, next.left.y, cover);
  const right = landmarkToBox(next.right.x, next.right.y, cover);
  const span = Math.abs(
    (mirrored ? width - left.x : left.x) - (mirrored ? width - right.x : right.x),
  );
  const eyeSpanPx = next.interocular * cover.drawW;
  const neckW = Math.max(span * 1.05, eyeSpanPx * NECKLACE_IO_RATIO * next.scale, 60);
  const neckH = neckW * aspect * 0.85;

  const scene = mediaEl
    ? sampleSceneNear(mediaEl, next.centerX, next.centerY)
    : { r: 120, g: 100, b: 90, lum: 0.35 };
  const depthFade = Math.max(0.55, 1 - Math.abs(next.yaw) * 0.35);
  const perspX = 1 - Math.abs(next.yaw) * 0.18;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(mirrored ? -next.roll * 0.5 : next.roll * 0.5);
  ctx.scale(perspX, 1);
  ctx.globalAlpha = 0.94 * depthFade;
  ctx.filter = sceneColorGrade(scene);
  ctx.shadowColor = `rgba(18, 12, 8, ${0.12 + scene.lum * 0.25})`;
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
  ctx.filter = "none";
  ctx.restore();
}

/** Dev-only dots: cyan = raw tragus, green = final anchor (after offsets). */
function drawAnchorDebug(
  ctx: CanvasRenderingContext2D,
  next: EarAnchors,
  cover: ReturnType<typeof getObjectCoverTransform>,
  mirrored: boolean,
  width: number,
) {
  const dbg = lastEarAnchorDebug;
  if (!dbg) return;

  const plot = (
    nx: number,
    ny: number,
    color: string,
    radius: number,
    label: string,
  ) => {
    const mapped = landmarkToBox(nx, ny, cover);
    const x = mirrored ? width - mapped.x : mapped.x;
    const y = mapped.y;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(label, x + 6, y - 6);
    ctx.restore();
  };

  plot(dbg.left.rawX, dbg.left.rawY, "rgba(0,220,255,0.95)", 4, "L raw");
  plot(dbg.left.finalX, dbg.left.finalY, "rgba(50,255,100,0.95)", 5, "L final");
  plot(dbg.right.rawX, dbg.right.rawY, "rgba(0,220,255,0.95)", 4, "R raw");
  plot(dbg.right.finalX, dbg.right.finalY, "rgba(50,255,100,0.95)", 5, "R final");
}
