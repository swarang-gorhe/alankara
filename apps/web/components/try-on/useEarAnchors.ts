"use client";

import { useMemo } from "react";
import { getTryOnKind } from "./tryOnAsset";
import type { EarAnchors, ManualAdjust, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";

/**
 * Face Mesh indices for ear / lobe / neck placement.
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

  const kind = getTryOnKind(product);
  const interocular = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || 0.08;
  const faceH =
    forehead && chin ? Math.hypot(chin.x - forehead.x, chin.y - forehead.y) : interocular * 2.4;

  // Blend tragus → cheek → jaw, then hang below for lobe seat
  const leftBaseX = lerp(lerp(lTragus.x, lCheek?.x ?? lTragus.x, 0.35), lJaw?.x ?? lTragus.x, 0.22);
  const leftBaseY = lerp(lerp(lTragus.y, lCheek?.y ?? lTragus.y, 0.28), lJaw?.y ?? lTragus.y, 0.42);
  const rightBaseX = lerp(lerp(rTragus.x, rCheek?.x ?? rTragus.x, 0.35), rJaw?.x ?? rTragus.x, 0.22);
  const rightBaseY = lerp(lerp(rTragus.y, rCheek?.y ?? rTragus.y, 0.28), rJaw?.y ?? rTragus.y, 0.42);

  // Sit on the lobe, not the cheek — slight outward + down
  const lobeDrop = faceH * 0.075;
  const outPush = interocular * 0.12;

  const ox = ((product.tryOnLeftOffsetX ?? 0) + manual.offsetX) / 100;
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

  // Natural size relative to face — earrings sit lighter; necklaces slightly larger
  const scaleBase =
    (interocular / 0.075) *
    (product.tryOnScale ?? 1) *
    manual.scale *
    (manual.zoom || 1) *
    (kind === "necklace" ? 1.15 : 0.92);

  // Necklace sits just below the chin, spanning jaw width
  const jawLx = lJaw?.x ?? leftBaseX;
  const jawRx = rJaw?.x ?? rightBaseX;
  const jawLy = lJaw?.y ?? leftBaseY;
  const jawRy = rJaw?.y ?? rightBaseY;
  const chinY = chin?.y ?? (jawLy + jawRy) / 2;
  const neckOx = manual.offsetX / 100;
  const neckOy = ((product.tryOnVerticalOffset ?? 0) + manual.offsetY) / 100;
  const centerX = (jawLx + jawRx) / 2 + neckOx;
  const centerY = chinY + faceH * 0.1 + neckOy;
  const neckWidth = Math.hypot(jawRx - jawLx, jawRy - jawLy) * 1.35;

  return {
    kind,
    left: {
      x: smooth(prev?.left.x, lx, 0.18),
      y: smooth(prev?.left.y, ly, 0.18),
      visible: leftVisible,
    },
    right: {
      x: smooth(prev?.right.x, rx, 0.18),
      y: smooth(prev?.right.y, ry, 0.18),
      visible: rightVisible,
    },
    centerX: smooth(prev?.centerX, centerX, 0.18),
    centerY: smooth(prev?.centerY, centerY, 0.18),
    neckWidth: smooth(prev?.neckWidth, neckWidth, 0.18),
    roll: smooth(prev?.roll, roll, 0.14),
    yaw: smooth(prev?.yaw, yaw, 0.14),
    scale: smooth(prev?.scale, scaleBase, 0.16),
    interocular: smooth(prev?.interocular, interocular, 0.16),
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
