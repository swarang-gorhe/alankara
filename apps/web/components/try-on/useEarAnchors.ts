"use client";

import { useMemo } from "react";
import type { EarAnchors, ManualAdjust, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";

/** MediaPipe Face Mesh approximate ear / temple indices */
const LEFT_EAR_IDX = 234;
const RIGHT_EAR_IDX = 454;
const LEFT_EYE_IDX = 33;
const RIGHT_EYE_IDX = 263;
const NOSE_IDX = 1;

function smooth(prev: number | undefined, next: number, alpha = 0.35): number {
  if (prev === undefined || Number.isNaN(prev)) return next;
  return prev * (1 - alpha) + next * alpha;
}

export function computeEarAnchors(
  landmarks: Array<{ x: number; y: number; z: number }>,
  product: TryOnProduct,
  manual: ManualAdjust = DEFAULT_MANUAL_ADJUST,
  prev?: EarAnchors | null,
): EarAnchors | null {
  if (!landmarks.length || landmarks.length < 468) return null;

  const leftRaw = landmarks[LEFT_EAR_IDX] ?? landmarks[127];
  const rightRaw = landmarks[RIGHT_EAR_IDX] ?? landmarks[356];
  const leftEye = landmarks[LEFT_EYE_IDX];
  const rightEye = landmarks[RIGHT_EYE_IDX];
  const nose = landmarks[NOSE_IDX];
  if (!leftRaw || !rightRaw || !leftEye || !rightEye) return null;

  const interocular = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || 0.08;
  const scaleBase = (interocular / 0.08) * (product.tryOnScale ?? 1) * manual.scale;

  // Offsets are percent of face width (~same as admin preview units / 100)
  const lx = leftRaw.x + ((product.tryOnLeftOffsetX ?? 0) + manual.offsetX) / 100;
  const ly =
    leftRaw.y +
    ((product.tryOnLeftOffsetY ?? 0) + (product.tryOnVerticalOffset ?? 0) + manual.offsetY) / 100;
  const rx = rightRaw.x + ((product.tryOnRightOffsetX ?? 0) + manual.offsetX) / 100;
  const ry =
    rightRaw.y +
    ((product.tryOnRightOffsetY ?? 0) + (product.tryOnVerticalOffset ?? 0) + manual.offsetY) / 100;

  const roll =
    Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) +
    ((product.tryOnRotation ?? 0) + manual.rotation) * (Math.PI / 180);

  // Rough yaw from nose vs eye midpoint
  const midX = (leftEye.x + rightEye.x) / 2;
  const yaw = nose ? (nose.x - midX) / interocular : 0;

  const leftVisible = leftRaw.z < 0.12 && yaw > -0.85;
  const rightVisible = rightRaw.z < 0.12 && yaw < 0.85;

  const next: EarAnchors = {
    left: {
      x: smooth(prev?.left.x, lx),
      y: smooth(prev?.left.y, ly),
      visible: leftVisible,
    },
    right: {
      x: smooth(prev?.right.x, rx),
      y: smooth(prev?.right.y, ry),
      visible: rightVisible,
    },
    roll: smooth(prev?.roll, roll, 0.4),
    yaw: smooth(prev?.yaw, yaw, 0.4),
    scale: smooth(prev?.scale, scaleBase, 0.35),
    interocular: smooth(prev?.interocular, interocular, 0.35),
  };

  return next;
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
