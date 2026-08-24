"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FaceLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    ts: number,
  ) => {
    faceLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
    facialTransformationMatrixes?: Array<{ data: Float32Array | number[] }>;
  };
  detect: (image: HTMLImageElement | HTMLCanvasElement) => {
    faceLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
    facialTransformationMatrixes?: Array<{ data: Float32Array | number[] }>;
  };
  setOptions: (opts: { runningMode: "IMAGE" | "VIDEO" }) => Promise<void>;
  close: () => void;
};

export type LandmarkFrame = {
  landmarks: Array<{ x: number; y: number; z: number }>;
  matrix?: Float32Array | number[];
  timestamp: number;
};

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export function useFaceLandmarker() {
  const landmarkerRef = useRef<FaceLandmarkerLike | null>(null);
  const modeRef = useRef<"IMAGE" | "VIDEO">("VIDEO");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (typeof window === "undefined") return;
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        if (!gl) {
          setUnsupported(true);
          setError("This device does not support WebGL for live try-on.");
          return;
        }

        const vision = await import("@mediapipe/tasks-vision");
        const { FilesetResolver, FaceLandmarker } = vision;
        const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFacialTransformationMatrixes: true,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker as unknown as FaceLandmarkerLike;
        modeRef.current = "VIDEO";
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load face detection");
          setUnsupported(true);
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  const ensureMode = useCallback(async (mode: "IMAGE" | "VIDEO") => {
    const lm = landmarkerRef.current;
    if (!lm || modeRef.current === mode) return;
    await lm.setOptions({ runningMode: mode });
    modeRef.current = mode;
  }, []);

  const detectVideo = useCallback(
    (video: HTMLVideoElement, timestamp: number): LandmarkFrame | null => {
      const lm = landmarkerRef.current;
      if (!lm || video.readyState < 2) return null;
      try {
        if (modeRef.current !== "VIDEO") {
          // Fire-and-forget mode switch; next frames will work
          void ensureMode("VIDEO");
          return null;
        }
        const result = lm.detectForVideo(video, timestamp);
        const face = result.faceLandmarks[0];
        if (!face?.length) return null;
        return {
          landmarks: face,
          matrix: result.facialTransformationMatrixes?.[0]?.data,
          timestamp,
        };
      } catch {
        return null;
      }
    },
    [ensureMode],
  );

  const detectImage = useCallback(
    async (image: HTMLImageElement | HTMLCanvasElement): Promise<LandmarkFrame | null> => {
      const lm = landmarkerRef.current;
      if (!lm) return null;
      try {
        await ensureMode("IMAGE");
        const result = lm.detect(image as HTMLImageElement);
        const face = result.faceLandmarks[0];
        if (!face?.length) return null;
        return {
          landmarks: face,
          matrix: result.facialTransformationMatrixes?.[0]?.data,
          timestamp: performance.now(),
        };
      } catch {
        return null;
      }
    },
    [ensureMode],
  );

  return { ready, error, unsupported, detectVideo, detectImage };
}
