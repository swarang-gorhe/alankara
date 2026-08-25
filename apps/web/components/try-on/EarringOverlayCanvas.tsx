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
import {
  computeAlphaBounds,
  findHookAnchor,
  getTryOnAssetUrl,
  type TrimBounds,
} from "./tryOnAsset";
import { lastEarAnchorDebug } from "./useEarAnchors";
import { isTryOnDebugEnabled } from "./tryOnDebug";
import type { EarAnchors, TryOnProduct } from "./types";

type EarringOverlayCanvasProps = {
  width: number;
  height: number;
  mediaWidth?: number;
  mediaHeight?: number;
  anchors: EarAnchors | null;
  product: TryOnProduct;
  showOverlay?: boolean;
  mirrored?: boolean;
  className?: string;
  drawRef?: MutableRefObject<((anchors: EarAnchors | null) => void) | null>;
};

/** Width as fraction of detected interocular span (px) — cloth drops ~30–34% */
const EARRING_IO_RATIO = 0.32;

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
  const hookRef = useRef<{ u: number; v: number }>({ u: 0.5, v: 0 });
  const featherRef = useRef<HTMLCanvasElement | null>(null);
  const featherPadRef = useRef(0);
  const anchorsRef = useRef<EarAnchors | null>(anchors);
  const url = getTryOnAssetUrl(product);

  useEffect(() => {
    anchorsRef.current = anchors;
  }, [anchors]);

  useEffect(() => {
    if (!url) {
      imgRef.current = null;
      trimRef.current = null;
      featherRef.current = null;
      hookRef.current = { u: 0.5, v: 0 };
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
        hookRef.current = findHookAnchor(img, trim);
        // 1.6–2px soft edge so cutouts match slightly soft camera
        const blurPx = 1.8;
        featherRef.current = buildFeatheredAsset(img, trim, blurPx);
        featherPadRef.current = Math.ceil(blurPx * 2);
      } else {
        hookRef.current = { u: 0.5, v: 0 };
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

    const mw = mediaWidth && mediaWidth > 0 ? mediaWidth : width;
    const mh = mediaHeight && mediaHeight > 0 ? mediaHeight : height;
    const cover = getObjectCoverTransform(mw, mh, width, height);

    if (showOverlay && next && imgRef.current) {
      const img = imgRef.current;
      if (img.complete && img.naturalWidth > 0) {
        const trim =
          trimRef.current ?? {
            sx: 0,
            sy: 0,
            sw: img.naturalWidth,
            sh: img.naturalHeight,
          };
        const aspect = trim.sh / Math.max(1, trim.sw);
        const mediaEl = findMediaElement(canvas);

        paintEarrings(
          ctx,
          img,
          trim,
          hookRef.current,
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
    }

    if (isTryOnDebugEnabled() && next) {
      drawAnchorDebug(ctx, cover, mirrored, width);
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

function paintEarrings(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  trim: TrimBounds,
  hook: { u: number; v: number },
  next: EarAnchors,
  cover: ReturnType<typeof getObjectCoverTransform>,
  aspect: number,
  mirrored: boolean,
  width: number,
  mediaEl: HTMLVideoElement | HTMLImageElement | null,
  feather: HTMLCanvasElement | null,
  featherPad: number,
) {
  const eyeSpanPx = next.interocular * cover.drawW;
  const baseW = eyeSpanPx * EARRING_IO_RATIO * next.scale;
  const baseH = baseW * aspect;

  const drawSide = (side: "left" | "right", order: number) => {
    const ear = next[side];
    if (!ear.visible) return;

    // Depth / foreshortening from head yaw — not a flat sticker
    const depthFade =
      side === "left"
        ? Math.max(0.22, 1 - Math.max(0, -next.yaw) * 0.85)
        : Math.max(0.22, 1 - Math.max(0, next.yaw) * 0.85);
    const depthScaleX =
      side === "left" ? 1 - next.yaw * 0.38 : 1 + next.yaw * 0.38;
    const depthScaleY =
      side === "left" ? 1 - Math.abs(next.yaw) * 0.08 : 1 - Math.abs(next.yaw) * 0.08;
    const w = baseW * Math.max(0.42, Math.abs(depthScaleX));
    const h = baseH * Math.max(0.55, depthScaleY);

    const mapped = landmarkToBox(ear.x, ear.y, cover);
    const cx = mirrored ? width - mapped.x : mapped.x;
    const cy = mapped.y;

    const scene = mediaEl
      ? sampleSceneNear(mediaEl, ear.x, ear.y)
      : { r: 120, g: 100, b: 90, lum: 0.35 };
    // Softer shadow in dim rooms, stronger when the scene is bright
    const shadowAlpha = Math.min(0.48, 0.1 + scene.lum * 0.38) * depthFade;
    const sway = Math.sin(next.roll * 2.2 + order) * (h * 0.012);

    // Place HOOK (not image center / top-left mid) on the pierce point
    const ox = -hook.u * w;
    const oy = -hook.v * h;

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(cx + sway, cy);
    ctx.rotate(mirrored ? -next.roll * 0.82 : next.roll * 0.82);
    if ((side === "left" && mirrored) || (side === "right" && !mirrored)) {
      ctx.scale(-1, 1);
    }
    ctx.scale(Math.sign(depthScaleX) || 1, 1);

    drawSoftDropShadow(
      ctx,
      ox + w * 0.5,
      oy + h * 0.92,
      w * 0.24,
      h * 0.05,
      shadowAlpha,
    );

    ctx.globalAlpha = 0.98 * depthFade;
    ctx.filter = sceneColorGrade(scene);
    drawFeathered(ctx, img, trim, feather, featherPad, ox, oy, w, h);
    ctx.filter = "none";

    // Warm multiply pass so cutout picks up room color temperature
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = (0.07 + scene.lum * 0.08) * depthFade;
    drawFeathered(ctx, img, trim, feather, featherPad, ox, oy, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  };

  if (next.yaw >= 0) {
    drawSide("left", 0);
    drawSide("right", 1);
  } else {
    drawSide("right", 0);
    drawSide("left", 1);
  }
}

function drawAnchorDebug(
  ctx: CanvasRenderingContext2D,
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
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(43,35,28,0.95)";
    ctx.strokeStyle = "rgba(250,243,231,0.9)";
    ctx.lineWidth = 3;
    ctx.strokeText(label, x + 7, y - 7);
    ctx.fillText(label, x + 7, y - 7);
    ctx.restore();
  };

  // Cyan = cheek 234/454; orange = lower oval 93/323; magenta = pierce (must sit on lobe)
  plot(dbg.left.cheekX, dbg.left.cheekY, "rgba(0,180,220,0.9)", 3.5, "L cheek");
  plot(dbg.left.lobeX, dbg.left.lobeY, "rgba(255,140,40,0.9)", 3.5, "L oval");
  plot(
    dbg.left.finalX,
    dbg.left.finalY,
    dbg.left.visible ? "rgba(220,40,180,0.98)" : "rgba(220,50,50,0.95)",
    6,
    dbg.left.visible ? "L pierce" : "L rej",
  );
  plot(dbg.right.cheekX, dbg.right.cheekY, "rgba(0,180,220,0.9)", 3.5, "R cheek");
  plot(dbg.right.lobeX, dbg.right.lobeY, "rgba(255,140,40,0.9)", 3.5, "R oval");
  plot(
    dbg.right.finalX,
    dbg.right.finalY,
    dbg.right.visible ? "rgba(220,40,180,0.98)" : "rgba(220,50,50,0.95)",
    6,
    dbg.right.visible ? "R pierce" : "R rej",
  );

  ctx.save();
  ctx.fillStyle = "rgba(250,243,231,0.92)";
  ctx.fillRect(8, 8, 200, 70);
  ctx.fillStyle = "#2B231C";
  ctx.font = "10px monospace";
  ctx.fillText(`yaw ${dbg.yaw.toFixed(3)}  io ${dbg.interocular.toFixed(3)}`, 14, 24);
  ctx.fillText(`L pierce (${dbg.left.finalX.toFixed(3)}, ${dbg.left.finalY.toFixed(3)})`, 14, 40);
  ctx.fillText(`R pierce (${dbg.right.finalX.toFixed(3)}, ${dbg.right.finalY.toFixed(3)})`, 14, 56);
  ctx.fillText("magenta = lobe target", 14, 70);
  ctx.restore();
}
