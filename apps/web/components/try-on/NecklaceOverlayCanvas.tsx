"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { getObjectCoverTransform, landmarkToBox } from "./coverMapping";
import {
  buildFeatheredAsset,
  drawFeathered,
  drawSoftDropShadow,
  findMediaElement,
  sampleSceneNear,
  sceneColorGrade,
} from "./compositing";
import { computeAlphaBounds, getTryOnAssetUrl, type TrimBounds } from "./tryOnAsset";
import { lastNecklaceAnchorDebug } from "./useNecklaceAnchors";
import type { NecklaceAnchors, TryOnProduct } from "./types";

type NecklaceOverlayCanvasProps = {
  width: number;
  height: number;
  mediaWidth?: number;
  mediaHeight?: number;
  anchors: NecklaceAnchors | null;
  product: TryOnProduct;
  showOverlay?: boolean;
  mirrored?: boolean;
  className?: string;
  drawRef?: MutableRefObject<((anchors: NecklaceAnchors | null) => void) | null>;
};

const DEV = process.env.NODE_ENV === "development";
/** Width as fraction of detected shoulder span (px) */
const NECKLACE_SHOULDER_RATIO = 0.72;

export function NecklaceOverlayCanvas({
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
}: NecklaceOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const trimRef = useRef<TrimBounds | null>(null);
  const featherRef = useRef<HTMLCanvasElement | null>(null);
  const featherPadRef = useRef(0);
  const anchorsRef = useRef<NecklaceAnchors | null>(anchors);
  const swayTRef = useRef(0);
  const url = getTryOnAssetUrl(product);

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
        const blurPx = 1.5;
        featherRef.current = buildFeatheredAsset(img, trim, blurPx);
        featherPadRef.current = Math.ceil(blurPx * 2);
      }
      paint(anchorsRef.current);
    };
  }, [url]);

  const paint = (next: NecklaceAnchors | null) => {
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

    if (!showOverlay || !next || !next.visible || !imgRef.current) return;
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

    const clasp = landmarkToBox(next.claspX, next.claspY, cover);
    const cx = mirrored ? width - clasp.x : clasp.x;
    const cy = clasp.y;

    const shoulderPx = next.shoulderWidth * cover.drawW;
    const neckW = Math.max(48, shoulderPx * NECKLACE_SHOULDER_RATIO * next.scale);
    const neckH = neckW * aspect;

    // Subtle sway — lag pendant vs clasp so the piece settles, not glues
    swayTRef.current += 0.04;
    const swayX =
      (next.pendantX - next.claspX) * cover.drawW * 0.35 +
      Math.sin(swayTRef.current) * (neckW * 0.008);
    const swayY =
      (next.pendantY - next.claspY) * cover.drawH * 0.15 +
      Math.abs(Math.sin(swayTRef.current * 0.7)) * (neckH * 0.006);

    const scene = mediaEl
      ? sampleSceneNear(mediaEl, next.claspX, next.claspY)
      : { r: 120, g: 100, b: 90, lum: 0.35 };
    const depthFade = Math.max(0.55, 1 - Math.abs(next.yaw) * 0.28);
    const shadowAlpha = Math.min(0.4, 0.1 + scene.lum * 0.28) * depthFade;

    ctx.save();
    // Clip out chin/jaw so necklace upper edge sits behind the face
    if (next.jawPoints.length >= 3) {
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      const first = landmarkToBox(next.jawPoints[0].x, next.jawPoints[0].y, cover);
      const fx = mirrored ? width - first.x : first.x;
      ctx.moveTo(fx, first.y);
      for (let i = 1; i < next.jawPoints.length; i++) {
        const p = landmarkToBox(next.jawPoints[i].x, next.jawPoints[i].y, cover);
        ctx.lineTo(mirrored ? width - p.x : p.x, p.y);
      }
      ctx.closePath();
      ctx.clip("evenodd");
    }

    ctx.translate(cx + (mirrored ? -swayX : swayX), cy + swayY);
    ctx.rotate(mirrored ? -next.torsoRoll : next.torsoRoll);

    drawSoftDropShadow(
      ctx,
      0,
      neckH * 0.55,
      neckW * 0.32,
      neckH * 0.06,
      shadowAlpha,
    );

    ctx.globalAlpha = 0.96 * depthFade;
    ctx.filter = sceneColorGrade(scene);
    // Hang FROM the top of the asset (clasp point), not center
    drawFeathered(
      ctx,
      img,
      trim,
      featherRef.current,
      featherPadRef.current,
      -neckW / 2,
      0,
      neckW,
      neckH,
    );
    ctx.filter = "none";

    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = (0.07 + scene.lum * 0.05) * depthFade;
    drawFeathered(
      ctx,
      img,
      trim,
      featherRef.current,
      featherPadRef.current,
      -neckW / 2,
      0,
      neckW,
      neckH,
    );
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();

    if (DEV) {
      drawNecklaceDebug(ctx, next, cover, mirrored, width);
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

function drawNecklaceDebug(
  ctx: CanvasRenderingContext2D,
  next: NecklaceAnchors,
  cover: ReturnType<typeof getObjectCoverTransform>,
  mirrored: boolean,
  width: number,
) {
  const dbg = lastNecklaceAnchorDebug;
  const plot = (nx: number, ny: number, color: string, r: number, label: string) => {
    const m = landmarkToBox(nx, ny, cover);
    const x = mirrored ? width - m.x : m.x;
    const y = m.y;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(label, x + 6, y - 6);
    ctx.restore();
  };

  if (dbg) {
    plot(dbg.shoulderMidX, dbg.shoulderMidY, "rgba(255,180,40,0.95)", 4, "shoulders");
    plot(dbg.neckBaseX, dbg.neckBaseY, "rgba(0,220,255,0.95)", 4, "neck-base");
    plot(dbg.claspX, dbg.claspY, "rgba(50,255,100,0.95)", 5, "clasp");
  } else {
    plot(next.claspX, next.claspY, "rgba(50,255,100,0.95)", 5, "clasp");
  }
}
