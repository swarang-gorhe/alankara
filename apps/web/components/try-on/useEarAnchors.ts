"use client";

import { useMemo } from "react";
import { getTryOnKind } from "./tryOnAsset";
import type { EarAnchors, ManualAdjust, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";

/**
 * Face Mesh does not expose true earlobes. Closest useful contour points:
 * - 234 / 454 — face-oval at ear / cheekbone height (often called "cheek")
 * - 93 / 323  — face-oval just below that, toward the jaw / lobe height
 *
 * Pierce ≈ blend of those, then pushed OUTWARD from the face midline.
 * Never blend toward chin (152) — that parked earrings on the jaw.
 */
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;
const LEFT_LOBE = 93;
const RIGHT_LOBE = 323;
const LEFT_EYE = 33;
const RIGHT_EYE = 263;
const NOSE = 1;
const FOREHEAD = 10;
const CHIN = 152;
const LEFT_JAW = 132;
const RIGHT_JAW = 361;

/** Debug snapshot for overlay — gated by isTryOnDebugEnabled(). */
export type EarAnchorDebug = {
  left: {
    cheekX: number;
    cheekY: number;
    lobeX: number;
    lobeY: number;
    rawX: number;
    rawY: number;
    offsetX: number;
    offsetY: number;
    finalX: number;
    finalY: number;
    visible: boolean;
    depth: number;
  };
  right: {
    cheekX: number;
    cheekY: number;
    lobeX: number;
    lobeY: number;
    rawX: number;
    rawY: number;
    offsetX: number;
    offsetY: number;
    finalX: number;
    finalY: number;
    visible: boolean;
    depth: number;
  };
  interocular: number;
  yaw: number;
  midX: number;
};

export let lastEarAnchorDebug: EarAnchorDebug | null = null;

/** EMA — lower alpha = more lag, reads as physically attached. */
function smooth(prev: number | undefined, next: number, alpha = 0.14): number {
  if (prev === undefined || Number.isNaN(prev)) return next;
  return prev * (1 - alpha) + next * alpha;
}

function pt(
  landmarks: Array<{ x: number; y: number; z: number }>,
  i: number,
): { x: number; y: number; z: number } | null {
  return landmarks[i] ?? null;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Earlobe pierce estimate from cheek + lower oval, pushed outward.
 * `outward` is a fraction of the cheek→midline vector length added again
 * so the point sits outside the cheek contour (on the lobe), not inside.
 */
function pierceFromContour(
  cheek: { x: number; y: number; z: number },
  lobe: { x: number; y: number; z: number } | null,
  midX: number,
  interocular: number,
): { x: number; y: number; z: number; cheekX: number; cheekY: number; lobeX: number; lobeY: number } {
  // Bias toward lower oval (lobe height); cheek alone sits too high/inward.
  const t = 0.62;
  const baseX = lobe ? lerp(cheek.x, lobe.x, t) : cheek.x;
  const baseY = lobe ? lerp(cheek.y, lobe.y, t) : cheek.y + interocular * 0.12;

  // OUTWARD: left cheek is left of mid → (cheek.x - midX) < 0; add more of that.
  // (Previous bug added a positive constant to left x → pushed INTO the cheek.)
  const outward = 0.28;
  const x = baseX + (baseX - midX) * outward;
  // Small extra drop so the hook sits on the lobe, not the canal.
  const y = baseY + interocular * 0.035;
  const z = lobe ? lerp(cheek.z, lobe.z, t) : cheek.z;

  return {
    x,
    y,
    z,
    cheekX: cheek.x,
    cheekY: cheek.y,
    lobeX: lobe?.x ?? cheek.x,
    lobeY: lobe?.y ?? baseY,
  };
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
  const lCheek = pt(landmarks, LEFT_CHEEK);
  const rCheek = pt(landmarks, RIGHT_CHEEK);
  const lLobe = pt(landmarks, LEFT_LOBE);
  const rLobe = pt(landmarks, RIGHT_LOBE);
  const lJaw = pt(landmarks, LEFT_JAW);
  const rJaw = pt(landmarks, RIGHT_JAW);

  if (!leftEye || !rightEye || !lCheek || !rCheek) return null;

  const kind = getTryOnKind(product);
  const interocular =
    Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || 0.08;
  const faceH =
    forehead && chin
      ? Math.hypot(chin.x - forehead.x, chin.y - forehead.y)
      : interocular * 2.4;

  const midX = (leftEye.x + rightEye.x) / 2;
  const leftPierce = pierceFromContour(lCheek, lLobe, midX, interocular);
  const rightPierce = pierceFromContour(rCheek, rLobe, midX, interocular);

  const leftRawX = leftPierce.x;
  const leftRawY = leftPierce.y;
  const rightRawX = rightPierce.x;
  const rightRawY = rightPierce.y;

  const leftOffX = ((product.tryOnLeftOffsetX ?? 0) + manual.offsetX) / 100;
  const leftOffY =
    ((product.tryOnLeftOffsetY ?? 0) + (product.tryOnVerticalOffset ?? 0) + manual.offsetY) /
    100;
  const rightOffX = ((product.tryOnRightOffsetX ?? 0) + manual.offsetX) / 100;
  const rightOffY =
    ((product.tryOnRightOffsetY ?? 0) + (product.tryOnVerticalOffset ?? 0) + manual.offsetY) /
    100;

  const lx = leftRawX + leftOffX;
  const ly = leftRawY + leftOffY;
  const rx = rightRawX + rightOffX;
  const ry = rightRawY + rightOffY;

  const roll =
    Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) +
    ((product.tryOnRotation ?? 0) + manual.rotation) * (Math.PI / 180);

  const yaw = nose ? (nose.x - midX) / interocular : 0;

  /**
   * Visibility is yaw-only. Soft fade for turned heads lives in the canvas.
   */
  const YAW_HIDE = 1.45;
  const leftVisible = yaw > -YAW_HIDE;
  const rightVisible = yaw < YAW_HIDE;

  const noseZ = nose?.z ?? 0;
  const leftDepth = leftPierce.z - noseZ;
  const rightDepth = rightPierce.z - noseZ;

  const scaleMultiplier =
    (product.tryOnScale ?? 1) *
    manual.scale *
    (manual.zoom || 1) *
    (kind === "necklace" ? 1.1 : 1);

  const jawLx = lJaw?.x ?? leftRawX;
  const jawRx = rJaw?.x ?? rightRawX;
  const jawLy = lJaw?.y ?? leftRawY;
  const jawRy = rJaw?.y ?? rightRawY;
  const chinY = chin?.y ?? (jawLy + jawRy) / 2;
  const neckOx = manual.offsetX / 100;
  const neckOy = ((product.tryOnVerticalOffset ?? 0) + manual.offsetY) / 100;
  const centerX = (jawLx + jawRx) / 2 + neckOx;
  const centerY = chinY + faceH * 0.1 + neckOy;
  const neckWidth = Math.hypot(jawRx - jawLx, jawRy - jawLy) * 1.35;

  lastEarAnchorDebug = {
    left: {
      cheekX: leftPierce.cheekX,
      cheekY: leftPierce.cheekY,
      lobeX: leftPierce.lobeX,
      lobeY: leftPierce.lobeY,
      rawX: leftRawX,
      rawY: leftRawY,
      offsetX: leftOffX,
      offsetY: leftOffY,
      finalX: lx,
      finalY: ly,
      visible: leftVisible,
      depth: leftDepth,
    },
    right: {
      cheekX: rightPierce.cheekX,
      cheekY: rightPierce.cheekY,
      lobeX: rightPierce.lobeX,
      lobeY: rightPierce.lobeY,
      rawX: rightRawX,
      rawY: rightRawY,
      offsetX: rightOffX,
      offsetY: rightOffY,
      finalX: rx,
      finalY: ry,
      visible: rightVisible,
      depth: rightDepth,
    },
    interocular,
    yaw,
    midX,
  };

  return {
    kind,
    left: {
      x: smooth(prev?.left.x, lx, 0.11),
      y: smooth(prev?.left.y, ly, 0.11),
      visible: leftVisible,
    },
    right: {
      x: smooth(prev?.right.x, rx, 0.11),
      y: smooth(prev?.right.y, ry, 0.11),
      visible: rightVisible,
    },
    centerX: smooth(prev?.centerX, centerX, 0.11),
    centerY: smooth(prev?.centerY, centerY, 0.11),
    neckWidth: smooth(prev?.neckWidth, neckWidth, 0.11),
    roll: smooth(prev?.roll, roll, 0.09),
    yaw: smooth(prev?.yaw, yaw, 0.09),
    scale: smooth(prev?.scale, scaleMultiplier, 0.1),
    interocular: smooth(prev?.interocular, interocular, 0.1),
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
