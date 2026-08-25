/**
 * Brightness/contrast boost for dim selfie frames before MediaPipe.
 * Returns the original video when light is adequate (no copy cost).
 */

const SAMPLE_W = 96;
const SAMPLE_H = 54;
/** Below this mean luminance (0–255), enhance the frame. */
const DIM_THRESHOLD = 95;

export function prepareDetectionSource(
  video: HTMLVideoElement,
  scratch: HTMLCanvasElement,
): HTMLVideoElement | HTMLCanvasElement {
  if (!video.videoWidth || !video.videoHeight) return video;

  const sw = Math.min(SAMPLE_W, video.videoWidth);
  const sh = Math.min(SAMPLE_H, video.videoHeight);
  scratch.width = sw;
  scratch.height = sh;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return video;

  ctx.drawImage(video, 0, 0, sw, sh);
  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, sw, sh);
  } catch {
    return video;
  }

  let sum = 0;
  const step = 16;
  for (let i = 0; i < data.data.length; i += step) {
    sum += data.data[i]! * 0.299 + data.data[i + 1]! * 0.587 + data.data[i + 2]! * 0.114;
  }
  const avg = sum / (data.data.length / step);
  if (avg >= DIM_THRESHOLD) return video;

  // Full-res enhance for landmarker
  const boost = 1.15 + Math.min(0.45, ((DIM_THRESHOLD - avg) / DIM_THRESHOLD) * 0.55);
  const contrast = 1.08 + Math.min(0.22, ((DIM_THRESHOLD - avg) / DIM_THRESHOLD) * 0.28);
  scratch.width = video.videoWidth;
  scratch.height = video.videoHeight;
  ctx.filter = `brightness(${boost}) contrast(${contrast})`;
  ctx.drawImage(video, 0, 0);
  ctx.filter = "none";
  return scratch;
}
