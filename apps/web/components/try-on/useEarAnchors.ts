"use client";

import { useMemo } from "react";
import type { EarAnchors, ManualAdjust, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";

/**
 * Face Mesh indices for ear / lobe placement.
 * 234/454 sit near the tragus; we blend with cheek/jaw and hang downward for the lobe.
 */
const LEFT_TRAGUS = 234;
const RIGHT_TRAGUS = 454;
const LEFT_CHEEK = 93;
const RIGHT_CHEEK = 323;
const LEFT_JAW = 132;
const RIGHT_JAW = 361;
const LEFT_EYE = 33;
const RIGHT_EYE = 263;
const NOSE = 1;
const FOREHEAD = 10;
const CHIN = 152;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Heavier previous weight → smoother, less jitter (Lenskart-like). */
function smooth(prev: number | undefined, next: number, alpha = 0.22): number {
  if (prev === undefined || Number.isNaN(prev)) return next;
  return prev * (1 - alpha) + next * alpha;
}

function pt(
  landmarks: Array<{ x: number; y: number; z: number }>,
  i: number,
): { x: number; y: number; z: number } | null {
  return landmarks[i] ?? null;
}

export function computeEarAnchors(
  landmarks: Array<{ x: number; y: number; z: number }>,
  product: TryOnProduct,
  manual: ManualAdjust = DEFAULT_MANUAL_ADJUST,
  prev?: EarAnchors | null,
): EarAnchors | null {
  if (!landmarks.length || landmarks.length < 468) return null;

  const leftEye = pt(landmarks, LEFT_EYE);
  const rightEye = pt(landmarks, RIGHT_EYE);
  const nose = pt(landmarks, NOSE);
  const forehead = pt(landmarks, FOREHEAD);
  const chin = pt(landmarks, CHIN);
  const lTragus = pt(landmarks, LEFT_TRAGUS);
  const rTragus = pt(landmarks, RIGHT_TRAGUS);
  const lCheek = pt(landmarks, LEFT_CHEEK);
  const rCheek = pt(landmarks, RIGHT_CHEEK);
  const lJaw = pt(landmarks, LEFT_JAW);
  const rJaw = pt(landmarks, RIGHT_JAW);

  if (!leftEye || !rightEye || !lTragus || !rTragus) return null;

  const interocular = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || 0.08;
  const faceH =
    forehead && chin ? Math.hypot(chin.x - forehead.x, chin.y - forehead.y) : interocular * 2.4;

  // Blend tragus → cheek → jaw, then hang below for lobe seat
  const leftBaseX = lerp(lerp(lTragus.x, lCheek?.x ?? lTragus.x, 0.35), lJaw?.x ?? lTragus.x, 0.2);
  const leftBaseY = lerp(lerp(lTragus.y, lCheek?.y ?? lTragus.y, 0.25), lJaw?.y ?? lTragus.y, 0.35);
  const rightBaseX = lerp(lerp(rTragus.x, rCheek?.x ?? rTragus.x, 0.35), rJaw?.x ?? rTragus.x, 0.2);
  const rightBaseY = lerp(lerp(rTragus.y, rCheek?.y ?? rTragus.y, 0.25), rJaw?.y ?? rTragus.y, 0.35);

  const lobeDrop = faceH * 0.06;
  const outPush = interocular * 0.08;

  const ox = ((product.tryOnLeftOffsetX ?? 0) + manual.offsetX) / 100;
  // right offset uses its own product fields; manual is shared
  const oy =
    ((product.tryOnLeftOffsetY ?? 0) + (product.tryOnVerticalOffset ?? 0) + manual.offsetY) / 100;
  const rox = ((product.tryOnRightOffsetX ?? 0) + manual.offsetX) / 100;
  const roy =
    ((product.tryOnRightOffsetY ?? 0) + (product.tryOnVerticalOffset ?? 0) + manual.offsetY) / 100;

  const lx = leftBaseX - outPush + ox;
  const ly = leftBaseY + lobeDrop + oy;
  const rx = rightBaseX + outPush + rox;
  const ry = rightBaseY + lobeDrop + roy;

  const roll =
    Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) +
    ((product.tryOnRotation ?? 0) + manual.rotation) * (Math.PI / 180);

  const midX = (leftEye.x + rightEye.x) / 2;
  const yaw = nose ? (nose.x - midX) / interocular : 0;

  // Soft visibility — keep drawing with fade rather than hard cut when slightly turned
  const leftVisible = yaw > -1.15;
  const rightVisible = yaw < 1.15;

  // Earring size tracks face distance; keep moderate for cloth drops
  const scaleBase =
    (interocular / 0.075) * (product.tryOnScale ?? 1) * manual.scale * (manual.zoom || 1);

  return {
    left: {
      x: smooth(prev?.left.x, lx, 0.2),
      y: smooth(prev?.left.y, ly, 0.2),
      visible: leftVisible,
    },
    right: {
      x: smooth(prev?.right.x, rx, 0.2),
      y: smooth(prev?.right.y, ry, 0.2),
      visible: rightVisible,
    },
    roll: smooth(prev?.roll, roll, 0.15),
    yaw: smooth(prev?.yaw, yaw, 0.15),
    scale: smooth(prev?.scale, scaleBase, 0.18),
    interocular: smooth(prev?.interocular, interocular, 0.18),
  };
}

export function useEarAnchors(
  landmarks: Array<{ x: number; y: number; z: number }> | null,
  product: TryOnProduct,
  manual: ManualAdjust = DEFAULT_MANUAL_ADJUST,
): EarAnchors | null {
  return useMemo(() => {
    if (!landmarks) return null;
    return computeEarAnchors(landmarks, product, manual);
  }, [landmarks, product, manual]);
}
