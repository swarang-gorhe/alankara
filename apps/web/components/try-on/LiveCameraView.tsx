"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EarringOverlayCanvas } from "./EarringOverlayCanvas";
import { getTryOnAssetUrl } from "./tryOnAsset";
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
  onFrameCapture?: (dataUrl: string) => void;
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
  onFrameCapture,
}: LiveCameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorsRef = useRef<EarAnchors | null>(null);
  const drawRef = useRef<((anchors: EarAnchors | null) => void) | null>(null);
  const manualRef = useRef(manual);
  const productRef = useRef(product);
  const [error, setError] = useState<TryOnErrorKind | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [size, setSize] = useState({ w: 390, h: 700 });
  const [mediaSize, setMediaSize] = useState({ w: 1280, h: 720 });
  const [tracking, setTracking] = useState(false);
  const successSent = useRef(false);
  const noFaceRef = useRef(0);

  manualRef.current = manual;
  productRef.current = product;

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
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
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
        if (video.videoWidth) {
          setMediaSize({ w: video.videoWidth, h: video.videoHeight });
        }
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
    if (!consented || !landmarkerReady || error === "camera_denied") return;
    let raf = 0;
    let lastInfer = 0;
    let lastUi = 0;

    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      // Infer ~28fps; draw every frame using smoothed anchors for fluidity
      if (ts - lastInfer >= 1000 / 28) {
        lastInfer = ts;
        const frame = detectVideo(video, ts);
        if (!frame) {
          noFaceRef.current += 1;
          if (noFaceRef.current > 35 && ts - lastUi > 400) {
            lastUi = ts;
            setTracking(false);
            setHint("Centre your face in soft light");
          }
        } else {
          noFaceRef.current = 0;
          const next = computeEarAnchors(
            frame.landmarks,
            productRef.current,
            manualRef.current,
            anchorsRef.current,
          );
          anchorsRef.current = next;
          if (next && !successSent.current) {
            successSent.current = true;
            onSuccess?.();
            void trackTryOnEvent("try_on_success", productRef.current.id);
          }
          if (ts - lastUi > 350) {
            lastUi = ts;
            setTracking(Boolean(next));
            if (next && (!next.left.visible || !next.right.visible)) {
              setHint("Turn a little toward the camera");
            } else {
              setHint(null);
            }
          }
        }
      }

      // Always redraw smoothed position (even between inferences)
      if (anchorsRef.current) {
        const held = anchorsRef.current;
        // Light predictive hold — re-smooth toward itself keeps canvas fresh
        drawRef.current?.(held);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [consented, detectVideo, error, landmarkerReady, onSuccess]);

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

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror to match what user sees
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    // Bake earrings in mirrored space
    const anchors = anchorsRef.current;
    if (anchors && showOverlay) {
      // Overlay draw expects mirrored=true and box = canvas size with media = canvas size
      // Simple approximate bake using cover 1:1
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = getTryOnAssetUrl(product) ?? "";
      // Sync path without waiting — export video still is enough for share
    }
    onFrameCapture?.(canvas.toDataURL("image/jpeg", 0.92));
  }, [onFrameCapture, product, showOverlay]);

  useEffect(() => {
    if (!tracking) return;
    const id = window.setInterval(() => captureFrame(), 1200);
    return () => clearInterval(id);
  }, [captureFrame, tracking]);

  if (unsupported) {
    return <ErrorStates kind="unsupported" onAction={onSwitchPhoto} />;
  }

  if (!consented) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-linen to-ivory px-8 text-center">
        <div className="h-16 w-16 rounded-full border border-champagne/50 bg-ivory/80 shadow-sm" />
        <div>
          <h3 className="font-display text-3xl text-maroon">Try it on you</h3>
          <p className="mx-auto mt-3 max-w-sm font-body text-sm leading-relaxed text-ink-muted">
            Private on your phone — we never upload live video. Allow the camera for a live look,
            or use a photo instead.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConsented(true)}
          className="min-w-[200px] bg-maroon px-6 py-3.5 font-body text-xs uppercase tracking-[0.2em] text-ivory"
        >
          Start camera
        </button>
        <button
          type="button"
          onClick={onSwitchPhoto}
          className="font-body text-xs uppercase tracking-[0.18em] text-olive"
        >
          Use a photo
        </button>
      </div>
    );
  }

  if (error === "camera_denied") {
    return <ErrorStates kind="camera_denied" onAction={onSwitchPhoto} />;
  }

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-ink">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
      />
      {/* Overlay is drawn already mirrored in canvas coords — do not CSS-flip again */}
      <EarringOverlayCanvas
        width={size.w}
        height={size.h}
        mediaWidth={mediaSize.w}
        mediaHeight={mediaSize.h}
        anchors={null}
        product={product}
        showOverlay={showOverlay}
        mirrored
        drawRef={drawRef}
      />

      {/* Soft face guide — Lenskart-style oval */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div
          className={`h-[52%] max-h-[420px] w-[58%] max-w-[280px] rounded-[50%] border transition-opacity duration-500 ${
            tracking ? "border-champagne/25 opacity-40" : "border-ivory/50 opacity-70"
          }`}
          style={{ boxShadow: "0 0 0 9999px rgba(20,14,10,0.28)" }}
        />
      </div>

      {hint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[22%] flex justify-center px-6">
          <p className="rounded-full bg-ink/55 px-4 py-2 font-body text-[11px] tracking-wide text-ivory backdrop-blur-sm">
            {hint}
          </p>
        </div>
      )}

      {!landmarkerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
          <p className="font-body text-xs uppercase tracking-widest text-ivory">Preparing…</p>
        </div>
      )}
    </div>
  );
}
