"use client";

import { useEffect, useRef, useState } from "react";
import { EarringOverlayCanvas } from "./EarringOverlayCanvas";
import { ErrorStates } from "./ErrorStates";
import { computeEarAnchors } from "./useEarAnchors";
import type { EarAnchors, ManualAdjust, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";
import { trackTryOnEvent } from "./tryOnAnalytics";

type PhotoUploadViewProps = {
  product: TryOnProduct;
  detectImage: (image: HTMLImageElement | HTMLCanvasElement) => Promise<{
    landmarks: Array<{ x: number; y: number; z: number }>;
  } | null>;
  landmarkerReady: boolean;
  manual?: ManualAdjust;
  showOverlay?: boolean;
  onAnchors?: (anchors: EarAnchors | null) => void;
  onPhotoReady?: (dataUrl: string) => void;
  onRetake?: () => void;
};

export function PhotoUploadView({
  product,
  detectImage,
  landmarkerReady,
  manual = DEFAULT_MANUAL_ADJUST,
  showOverlay = true,
  onAnchors,
  onPhotoReady,
  onRetake,
}: PhotoUploadViewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [anchors, setAnchors] = useState<EarAnchors | null>(null);
  const [size, setSize] = useState({ w: 640, h: 800 });
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.max(1, Math.floor(width)), h: Math.max(1, Math.floor(height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewUrl]);

  useEffect(() => {
    if (!previewUrl || !landmarkerReady || !imgRef.current) return;
    let cancelled = false;
    setBusy(true);
    setFailed(false);

    const run = async () => {
      const img = imgRef.current;
      if (!img) return;
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
      const frame = await detectImage(img);
      if (cancelled) return;
      if (!frame) {
        setFailed(true);
        setAnchors(null);
        onAnchors?.(null);
        setBusy(false);
        return;
      }
      const next = computeEarAnchors(frame.landmarks, product, manual);
      setAnchors(next);
      onAnchors?.(next);
      void trackTryOnEvent("try_on_success", product.id);
      setBusy(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [detectImage, landmarkerReady, manual, onAnchors, previewUrl, product]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    void trackTryOnEvent("photo_upload", product.id);

    // Build a data URL for share/download later
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPhotoReady?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (!previewUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-linen/70 px-6 text-center">
        <h3 className="font-display text-2xl text-maroon">Use a still moment</h3>
        <p className="max-w-sm font-body text-sm text-ink-muted">
          Take a photo or upload one from your gallery. Detection runs only on your device.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <label className="cursor-pointer bg-maroon px-4 py-2.5 font-body text-xs uppercase tracking-widest text-ivory">
            Take a photo
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="cursor-pointer border border-maroon/40 bg-ivory px-4 py-2.5 font-body text-xs uppercase tracking-widest text-maroon">
            Upload photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <ErrorStates
        kind="no_face"
        onAction={() => {
          setPreviewUrl(null);
          setFailed(false);
          onRetake?.();
        }}
      />
    );
  }

  return (
    <div ref={wrapRef} className="relative h-full min-h-[320px] overflow-hidden bg-ink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={previewUrl}
        alt="Your photo for try-on"
        className="absolute inset-0 h-full w-full object-contain"
      />
      <EarringOverlayCanvas
        width={size.w}
        height={size.h}
        anchors={anchors}
        product={product}
        showOverlay={showOverlay}
      />
      {busy && (
        <p className="absolute inset-x-0 bottom-4 text-center font-body text-xs text-ivory">
          Placing your earrings…
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          setPreviewUrl(null);
          setAnchors(null);
          onRetake?.();
        }}
        className="absolute right-3 top-3 border border-ivory/40 bg-maroon/80 px-3 py-1.5 font-body text-[10px] uppercase tracking-widest text-ivory"
      >
        Retake
      </button>
    </div>
  );
}
