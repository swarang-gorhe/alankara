"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PoseLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    ts: number,
  ) => {
    landmarks: Array<Array<{ x: number; y: number; z: number; visibility?: number }>>;
  };
  detect: (image: HTMLImageElement | HTMLCanvasElement) => {
    landmarks: Array<Array<{ x: number; y: number; z: number; visibility?: number }>>;
  };
  setOptions: (opts: { runningMode: "IMAGE" | "VIDEO" }) => Promise<void>;
  close: () => void;
};

export type PoseLandmarkFrame = {
  landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>;
  timestamp: number;
};

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

/** MediaPipe Pose — left/right shoulder indices. */
export const POSE_LEFT_SHOULDER = 11;
export const POSE_RIGHT_SHOULDER = 12;

export function usePoseLandmarker(enabled = true) {
  const landmarkerRef = useRef<PoseLandmarkerLike | null>(null);
  const modeRef = useRef<"IMAGE" | "VIDEO">("VIDEO");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }
    let cancelled = false;

    async function init() {
      try {
        if (typeof window === "undefined") return;
        const vision = await import("@mediapipe/tasks-vision");
        const { FilesetResolver, PoseLandmarker } = vision;
        const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
        const landmarker = await PoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker as unknown as PoseLandmarkerLike;
        modeRef.current = "VIDEO";
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load pose detection");
          setReady(false);
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [enabled]);

  const ensureMode = useCallback(async (mode: "IMAGE" | "VIDEO") => {
    const lm = landmarkerRef.current;
    if (!lm || modeRef.current === mode) return;
    await lm.setOptions({ runningMode: mode });
    modeRef.current = mode;
  }, []);

  const detectVideo = useCallback(
    (video: HTMLVideoElement, timestamp: number): PoseLandmarkFrame | null => {
      const lm = landmarkerRef.current;
      if (!lm || video.readyState < 2) return null;
      try {
        if (modeRef.current !== "VIDEO") {
          void ensureMode("VIDEO");
          return null;
        }
        const result = lm.detectForVideo(video, timestamp);
        const pose = result.landmarks[0];
        if (!pose?.length) return null;
        return { landmarks: pose, timestamp };
      } catch {
        return null;
      }
    },
    [ensureMode],
  );

  const detectImage = useCallback(
    async (
      image: HTMLImageElement | HTMLCanvasElement,
    ): Promise<PoseLandmarkFrame | null> => {
      const lm = landmarkerRef.current;
      if (!lm) return null;
      try {
        await ensureMode("IMAGE");
        const result = lm.detect(image as HTMLImageElement);
        const pose = result.landmarks[0];
        if (!pose?.length) return null;
        return { landmarks: pose, timestamp: performance.now() };
      } catch {
        return null;
      }
    },
    [ensureMode],
  );

  return { ready, error, detectVideo, detectImage };
}
