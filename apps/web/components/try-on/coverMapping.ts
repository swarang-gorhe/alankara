/** Map normalized MediaPipe coords (0–1 on the media) into a box that uses object-cover. */

export type CoverTransform = {
  offsetX: number;
  offsetY: number;
  drawW: number;
  drawH: number;
};

export function getObjectCoverTransform(
  mediaW: number,
  mediaH: number,
  boxW: number,
  boxH: number,
): CoverTransform {
  if (mediaW <= 0 || mediaH <= 0 || boxW <= 0 || boxH <= 0) {
    return { offsetX: 0, offsetY: 0, drawW: boxW, drawH: boxH };
  }
  const mediaAspect = mediaW / mediaH;
  const boxAspect = boxW / boxH;
  if (mediaAspect > boxAspect) {
    const drawH = boxH;
    const drawW = boxH * mediaAspect;
    return { offsetX: (boxW - drawW) / 2, offsetY: 0, drawW, drawH };
  }
  const drawW = boxW;
  const drawH = boxW / mediaAspect;
  return { offsetX: 0, offsetY: (boxH - drawH) / 2, drawW, drawH };
}

export function landmarkToBox(
  nx: number,
  ny: number,
  t: CoverTransform,
): { x: number; y: number } {
  return {
    x: t.offsetX + nx * t.drawW,
    y: t.offsetY + ny * t.drawH,
  };
}
