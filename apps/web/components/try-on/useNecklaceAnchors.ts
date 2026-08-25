"use client";

import { useMemo } from "react";
import { emaSmooth } from "./compositing";
import { POSE_LEFT_SHOULDER, POSE_RIGHT_SHOULDER } from "./usePoseLandmarker";
import type { ManualAdjust, NecklaceAnchors, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";

/** Face Mesh — chin / jaw upper bound for neck-base. */
const CHIN = 152;
const LEFT_JAW = 172;
const RIGHT_JAW = 397;
const LEFT_EYE = 33;
const RIGHT_EYE = 263;

const DEV = process.env.NODE_ENV === "development";

export type NecklaceAnchorDebug = {
  shoulderMidX: number;
  shoulderMidY: number;
  chinY: number;
  neckBaseX: number;
  neckBaseY: number;
  lengthOffset: number;
  claspX: number;
  claspY: number;
  shoulderWidth: number;
  torsoRoll: number;
};

export let lastNecklaceAnchorDebug: NecklaceAnchorDebug | null = null;

function pt(
  landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>,
  i: number,
): { x: number; y: number; z: number; visibility?: number } | null {
  return landmarks[i] ?? null;
}

/**
 * Parallel necklace anchor pipeline — NOT ear-anchor math.
 * Neck-base = midpoint of shoulders, lifted toward chin; scale from shoulder width;
 * roll from shoulder line (torso), not head alone.
 */
export function computeNecklaceAnchors(
  faceLandmarks: Array<{ x: number; y: number; z: number }> | null,
  poseLandmarks: Array<{ x: number; y: number; z: number; visibility?: number }> | null,
  product: TryOnProduct,
  manual: ManualAdjust = DEFAULT_MANUAL_ADJUST,
  prev?: NecklaceAnchors | null,
): NecklaceAnchors | null {
  if (!poseLandmarks?.length || poseLandmarks.length < 13) return null;

  const lShoulder = pt(poseLandmarks, POSE_LEFT_SHOULDER);
  const rShoulder = pt(poseLandmarks, POSE_RIGHT_SHOULDER);
  if (!lShoulder || !rShoulder) return null;

  const lVis = lShoulder.visibility ?? 1;
  const rVis = rShoulder.visibility ?? 1;
  if (lVis < 0.35 || rVis < 0.35) return null;

  const shoulderMidX = (lShoulder.x + rShoulder.x) / 2;
  const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
  const shoulderWidth = Math.hypot(rShoulder.x - lShoulder.x, rShoulder.y - lShoulder.y) || 0.22;

  // Upper bound: chin/jaw from face mesh when available
  let chinY = shoulderMidY - shoulderWidth * 0.55;
  let jawLx = shoulderMidX - shoulderWidth * 0.28;
  let jawRx = shoulderMidX + shoulderWidth * 0.28;
  if (faceLandmarks && faceLandmarks.length >= 468) {
    const chin = faceLandmarks[CHIN];
    const lj = faceLandmarks[LEFT_JAW];
    const rj = faceLandmarks[RIGHT_JAW];
    if (chin) chinY = chin.y;
    if (lj) jawLx = lj.x;
    if (rj) jawRx = rj.x;
  }

  // Neck-base: between shoulders and chin (closer to chin for clasp seating)
  const neckBaseX = shoulderMidX + manual.offsetX / 100;
  const neckBaseY =
    chinY * 0.55 +
    shoulderMidY * 0.45 +
    manual.offsetY / 100;

  // Per-product chain length — how far the TOP of the asset hangs below neck-base
  const lengthOffset =
    ((product.tryOnNecklaceLengthOffset ?? 0) / 100) * shoulderWidth;

  const claspX = neckBaseX;
  const claspY = neckBaseY + lengthOffset;

  // Torso roll from shoulders — necklace follows torso more than head tilt
  const torsoRoll =
    Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x) +
    ((product.tryOnNecklaceRotationOffset ?? 0) + manual.rotation) * (Math.PI / 180);

  // Head yaw from eyes when available (occlusion / fade)
  let yaw = 0;
  if (faceLandmarks && faceLandmarks.length >= 468) {
    const le = faceLandmarks[LEFT_EYE];
    const re = faceLandmarks[RIGHT_EYE];
    if (le && re) {
      const io = Math.hypot(re.x - le.x, re.y - le.y) || 0.08;
      const mid = (le.x + re.x) / 2;
      const nose = faceLandmarks[1];
      yaw = nose ? (nose.x - mid) / io : 0;
    }
  }

  const scale =
    (product.tryOnNecklaceScale ?? product.tryOnScale ?? 1) *
    manual.scale *
    (manual.zoom || 1);

  // Jaw polygon for chin occlusion mask (normalized)
  const jawPoints = [
    { x: jawLx, y: chinY - shoulderWidth * 0.08 },
    { x: shoulderMidX, y: chinY },
    { x: jawRx, y: chinY - shoulderWidth * 0.08 },
    { x: jawRx, y: chinY - shoulderWidth * 0.35 },
    { x: jawLx, y: chinY - shoulderWidth * 0.35 },
  ];

  if (DEV) {
    lastNecklaceAnchorDebug = {
      shoulderMidX,
      shoulderMidY,
      chinY,
      neckBaseX,
      neckBaseY,
      lengthOffset,
      claspX,
      claspY,
      shoulderWidth,
      torsoRoll,
    };
  }

  return {
    claspX: emaSmooth(prev?.claspX, claspX, 0.12),
    claspY: emaSmooth(prev?.claspY, claspY, 0.12),
    // Pendant springs behind clasp with lag for drape feel
    pendantX: emaSmooth(prev?.pendantX, claspX, 0.07),
    pendantY: emaSmooth(prev?.pendantY, claspY + shoulderWidth * 0.12, 0.07),
    shoulderWidth: emaSmooth(prev?.shoulderWidth, shoulderWidth, 0.12),
    torsoRoll: emaSmooth(prev?.torsoRoll, torsoRoll, 0.1),
    yaw: emaSmooth(prev?.yaw, yaw, 0.1),
    scale: emaSmooth(prev?.scale, scale, 0.1),
    jawPoints,
    visible: true,
  };
}

export function useNecklaceAnchors(
  faceLandmarks: Array<{ x: number; y: number; z: number }> | null,
  poseLandmarks: Array<{ x: number; y: number; z: number; visibility?: number }> | null,
  product: TryOnProduct,
  manual: ManualAdjust = DEFAULT_MANUAL_ADJUST,
): NecklaceAnchors | null {
  return useMemo(
    () => computeNecklaceAnchors(faceLandmarks, poseLandmarks, product, manual),
    [faceLandmarks, poseLandmarks, product, manual],
  );
}
