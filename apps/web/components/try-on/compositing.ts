/** Shared try-on compositing helpers — lighting, feather, EMA. Used by earring + necklace pipelines. */

import type { TrimBounds } from "./tryOnAsset";

export type SceneSample = { r: number; g: number; b: number; lum: number };

const sampleCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
const sampleCtx = sampleCanvas?.getContext("2d", { willReadFrequently: true }) ?? null;

/** EMA — lower alpha = more lag (reads as physically attached). */
export function emaSmooth(prev: number | undefined, next: number, alpha = 0.14): number {
  if (prev === undefined || Number.isNaN(prev)) return next;
  return prev * (1 - alpha) + next * alpha;
}

export function findMediaElement(
  canvas: HTMLCanvasElement,
): HTMLVideoElement | HTMLImageElement | null {
  const root = canvas.parentElement;
  if (!root) return null;
  const video = root.querySelector("video");
  if (video && video.readyState >= 2) return video;
  const img = root.querySelector('img[alt*="try-on"], img[alt*="photo"]');
  return img instanceof HTMLImageElement && img.complete ? img : null;
}

export function sampleSceneNear(
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

export function buildFeatheredAsset(
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

export function sceneColorGrade(sample: SceneSample): string {
  const warmth = sample.r / Math.max(1, sample.b) - 1;
  const bright = 0.55 + sample.lum * 0.75;
  const sat = 0.82 + sample.lum * 0.18;
  const sepia = Math.min(0.35, Math.max(0, warmth * 0.12));
  return `brightness(${bright.toFixed(2)}) saturate(${sat.toFixed(2)}) sepia(${sepia.toFixed(2)})`;
}

export function drawFeathered(
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

export function drawSoftDropShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(18, 12, 8, 0.85)";
  ctx.filter = "blur(5px)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = "none";
  ctx.restore();
}
