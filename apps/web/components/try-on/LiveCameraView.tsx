"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EarringOverlayCanvas } from "./EarringOverlayCanvas";
import { ErrorStates } from "./ErrorStates";
import { computeEarAnchors } from "./useEarAnchors";
import type { EarAnchors, ManualAdjust, TryOnErrorKind, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";
import { trackTryOnEvent } from "./tryOnAnalytics";

type LiveCameraViewProps = {
  product: TryOnProduct;
  detectVideo: (video: HTMLVideoElement, ts: number) => {
    landmarks: Array<{ x: number; y: number; z: number }>;
  } | null;
  landmarkerReady: boolean;
  unsupported: boolean;
  onSwitchPhoto: () => void;
  onSuccess?: () => void;
  manual?: ManualAdjust;
  showOverlay?: boolean;
};

export function LiveCameraView({
  product,
  detectVideo,
  landmarkerReady,
  unsupported,
  onSwitchPhoto,
  onSuccess,
  manual = DEFAULT_MANUAL_ADJUST,
  showOverlay = true,
}: LiveCameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorsRef = useRef<EarAnchors | null>(null);
  const [anchors, setAnchors] = useState<EarAnchors | null>(null);
  const [error, setError] = useState<TryOnErrorKind | null>(null);
  const [consented, setConsented] = useState(false);
  const [size, setSize] = useState({ w: 640, h: 480 });
  const [noFaceFrames, setNoFaceFrames] = useState(0);
  const successSent = useRef(false);

  const stopStream = useCallback(() => {
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
  }, []);

  useEffect(() => {
    if (!consented || unsupported) return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        void trackTryOnEvent("camera_start", product.id);
        setError(null);
      } catch {
        setError("camera_denied");
      }
    }

    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [consented, product.id, stopStream, unsupported]);

  useEffect(() => {
    if (!consented || !landmarkerReady || error) return;
    let raf = 0;
    let lastInfer = 0;
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (ts - lastInfer < 1000 / 26) return; // ~26fps
      lastInfer = ts;
      const frame = detectVideo(video, ts);
      if (!frame) {
        setNoFaceFrames((n) => n + 1);
        return;
      }
      setNoFaceFrames(0);
      const next = computeEarAnchors(frame.landmarks, product, manual, anchorsRef.current);
      anchorsRef.current = next;
      setAnchors(next);
      if (next && !successSent.current) {
        successSent.current = true;
        onSuccess?.();
        void trackTryOnEvent("try_on_success", product.id);
      }
      if (next && (!next.left.visible || !next.right.visible)) {
        setError("one_ear");
      } else if (error === "one_ear" || error === "no_face") {
        setError(null);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [consented, detectVideo, error, landmarkerReady, manual, onSuccess, product]);

  useEffect(() => {
    if (noFaceFrames > 40) setError("no_face");
  }, [noFaceFrames]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.max(1, Math.floor(width)), h: Math.max(1, Math.floor(height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [consented]);

  if (unsupported) {
    return <ErrorStates kind="unsupported" onAction={onSwitchPhoto} />;
  }

  if (!consented) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-linen/80 px-6 text-center">
        <h3 className="font-display text-2xl text-maroon">A private looking glass</h3>
        <p className="max-w-md font-body text-sm leading-relaxed text-ink-muted">
          Your camera stays on this device. We never upload live video. A photo is shared with
          Alankara only if you choose “Share My Look.”
        </p>
        <button
          type="button"
          onClick={() => setConsented(true)}
          className="bg-maroon px-5 py-2.5 font-body text-xs uppercase tracking-widest text-ivory"
        >
          Allow camera & begin
        </button>
        <button
          type="button"
          onClick={onSwitchPhoto}
          className="font-body text-xs uppercase tracking-widest text-olive underline-offset-4 hover:underline"
        >
          Prefer a photo instead
        </button>
      </div>
    );
  }

  if (error === "camera_denied") {
    return <ErrorStates kind="camera_denied" onAction={onSwitchPhoto} />;
  }

  return (
    <div ref={wrapRef} className="relative h-full min-h-[320px] overflow-hidden bg-ink">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
      />
      <div className="absolute inset-0 scale-x-[-1]">
        <EarringOverlayCanvas
          width={size.w}
          height={size.h}
          anchors={anchors}
          product={product}
          showOverlay={showOverlay}
        />
      </div>
      {error === "no_face" && (
        <div className="absolute inset-x-0 bottom-4 px-4">
          <p className="bg-ivory/90 px-3 py-2 text-center font-body text-xs text-maroon">
            Centre your face in soft light — we’re waiting for you.
          </p>
        </div>
      )}
      {error === "one_ear" && (
        <div className="absolute inset-x-0 bottom-4 px-4">
          <p className="bg-ivory/90 px-3 py-2 text-center font-body text-xs text-maroon">
            Turn a little toward the camera so both ears can wear the pair.
          </p>
        </div>
      )}
    </div>
  );
}
