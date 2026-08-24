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
  const [size, setSize] = useState({ w: 390, h: 700 });
  const [mediaSize, setMediaSize] = useState({ w: 0, h: 0 });
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
      if (img.naturalWidth) {
        setMediaSize({ w: img.naturalWidth, h: img.naturalHeight });
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
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPhotoReady?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (!previewUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-linen to-ivory px-8 text-center">
        <h3 className="font-display text-3xl text-maroon">Use a still</h3>
        <p className="max-w-sm font-body text-sm text-ink-muted">
          Face the camera in soft light, hair tucked behind the ears if you can.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="cursor-pointer bg-maroon px-6 py-3.5 font-body text-xs uppercase tracking-[0.18em] text-ivory">
            Take photo
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="cursor-pointer border border-maroon/35 bg-ivory px-6 py-3.5 font-body text-xs uppercase tracking-[0.18em] text-maroon">
            Upload
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
        className="absolute inset-0 h-full w-full object-cover"
      />
      <EarringOverlayCanvas
        width={size.w}
        height={size.h}
        mediaWidth={mediaSize.w || size.w}
        mediaHeight={mediaSize.h || size.h}
        anchors={anchors}
        product={product}
        showOverlay={showOverlay}
        mirrored={false}
      />
      {busy && (
        <p className="absolute inset-x-0 bottom-24 text-center font-body text-xs text-ivory">
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
        className="absolute right-4 top-20 z-10 rounded-full bg-ink/50 px-3 py-1.5 font-body text-[10px] uppercase tracking-widest text-ivory backdrop-blur-md"
      >
        Retake
      </button>
    </div>
  );
}
