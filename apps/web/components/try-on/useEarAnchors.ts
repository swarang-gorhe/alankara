"use client";

import { useMemo } from "react";
import { getTryOnKind } from "./tryOnAsset";
import type { EarAnchors, ManualAdjust, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";

/**
 * Face Mesh indices — tragus region (ear-ring pierce point).
 * Avoid jaw/chin indices; blending toward jaw was anchoring on the chin.
 */
const LEFT_TRAGUS = 234;
const RIGHT_TRAGUS = 454;
const LEFT_EYE = 33;
const RIGHT_EYE = 263;
const NOSE = 1;
const FOREHEAD = 10;
const CHIN = 152;
const LEFT_JAW = 132;
const RIGHT_JAW = 361;

/** Last anchor breakdown for debug overlay (gated by isTryOnDebugEnabled). */
export type EarAnchorDebug = {
  left: {
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
  const lJaw = pt(landmarks, LEFT_JAW);
  const rJaw = pt(landmarks, RIGHT_JAW);

  if (!leftEye || !rightEye || !lTragus || !rTragus) return null;

  const kind = getTryOnKind(product);
  const interocular =
    Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || 0.08;
  const faceH =
    forehead && chin
      ? Math.hypot(chin.x - forehead.x, chin.y - forehead.y)
      : interocular * 2.4;

  // Pierce point: tragus + tiny drop for the hook (NOT jaw/chin blend)
  const hookDrop = interocular * 0.042;
  const outPush = interocular * 0.055;

  const leftRawX = lTragus.x + outPush;
  const leftRawY = lTragus.y + hookDrop;
  const rightRawX = rTragus.x - outPush;
  const rightRawY = rTragus.y + hookDrop;

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

  const midX = (leftEye.x + rightEye.x) / 2;
  const yaw = nose ? (nose.x - midX) / interocular : 0;

  /**
   * Visibility is yaw-only. Do NOT gate on (tragus.z − nose.z): on a frontal
   * face MediaPipe places ears behind the nose tip, so depth is usually > 0.05
   * and both ears were marked invisible — stuck on "Turn a little…".
   * Soft fade for turned heads lives in EarringOverlayCanvas via yaw.
   */
  const YAW_HIDE = 1.45;
  const leftVisible = yaw > -YAW_HIDE;
  const rightVisible = yaw < YAW_HIDE;

  const noseZ = nose?.z ?? 0;
  const leftDepth = (lTragus.z ?? 0) - noseZ;
  const rightDepth = (rTragus.z ?? 0) - noseZ;

  // try_on_scale is a multiplier against interocular — NOT an absolute pixel size
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
