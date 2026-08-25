"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, ImageIcon, ShoppingBag, X } from "lucide-react";
import { LiveCameraView } from "./LiveCameraView";
import { ManualAdjustControls } from "./ManualAdjustControls";
import { PhotoUploadView } from "./PhotoUploadView";
import { ShareMyLookForm } from "./ShareMyLookForm";
import { useFaceLandmarker } from "./useFaceLandmarker";
import { usePoseLandmarker } from "./usePoseLandmarker";
import { getTryOnType } from "./tryOnAsset";
import { trackTryOnEvent } from "./tryOnAnalytics";
import type { ManualAdjust, TryOnMode, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";
import { cn } from "@/lib/utils";

type TryOnModalProps = {
  open: boolean;
  product: TryOnProduct;
  onClose: () => void;
};

/**
 * Boutique fitting-room try-on: warm ivory stage, framed camera,
 * chrome aligned with Alankara serif / maroon language.
 */
export function TryOnModal({ open, product, onClose }: TryOnModalProps) {
  const [mode, setMode] = useState<TryOnMode>("live");
  const [manual, setManual] = useState<ManualAdjust>(DEFAULT_MANUAL_ADJUST);
  const [showAfter, setShowAfter] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const isNecklace = getTryOnType(product) === "necklace";
  const { ready, unsupported, detectVideo, detectImage } = useFaceLandmarker();
  const {
    ready: poseReady,
    detectVideo: detectPoseVideo,
    detectImage: detectPoseImage,
  } = usePoseLandmarker(open && isNecklace);

  useEffect(() => {
    if (!open) return;
    void trackTryOnEvent("open", product.id);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-try-on-open", "true");
    return () => {
      document.body.style.overflow = prev;
      document.body.removeAttribute("data-try-on-open");
    };
  }, [open, product.id]);

  useEffect(() => {
    if (unsupported) setMode("photo");
  }, [unsupported]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-gradient-to-b from-ivory via-[#F7EDE0] to-linen"
      role="dialog"
      aria-modal="true"
      aria-label={`Try on ${product.name}`}
    >
      <div className="absolute inset-0">
        {shareOpen ? (
          <div className="flex h-full items-end justify-center bg-ivory sm:items-center">
            <div className="max-h-[92vh] w-full max-w-md overflow-hidden bg-ivory sm:rounded-sm sm:shadow-luxury-lg">
              <ShareMyLookForm
                product={product}
                photoDataUrl={photoDataUrl}
                onClose={() => setShareOpen(false)}
              />
            </div>
          </div>
        ) : mode === "live" ? (
          <LiveCameraView
            product={product}
            detectVideo={detectVideo}
            detectPoseVideo={isNecklace ? detectPoseVideo : undefined}
            landmarkerReady={ready}
            poseReady={!isNecklace || poseReady}
            unsupported={unsupported}
            onSwitchPhoto={() => setMode("photo")}
            manual={manual}
            showOverlay={showAfter}
            onFrameCapture={setPhotoDataUrl}
          />
        ) : (
          <PhotoUploadView
            product={product}
            detectImage={detectImage}
            detectPoseImage={isNecklace ? detectPoseImage : undefined}
            landmarkerReady={ready}
            poseReady={!isNecklace || poseReady}
            manual={manual}
            showOverlay={showAfter}
            onPhotoReady={setPhotoDataUrl}
          />
        )}
      </div>

      {!shareOpen && (
        <>
          {/* Top floating chrome — keep product name / privacy treatment */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-ivory via-ivory/90 to-transparent pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="pointer-events-auto flex items-center justify-between px-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/40 bg-ivory/90 text-maroon shadow-sm backdrop-blur-md"
                aria-label="Close try-on"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-3 min-w-0 flex-1 text-center">
                <p className="truncate font-display text-base text-maroon sm:text-lg">
                  {product.name}
                </p>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                  Try it on · private on device
                </p>
              </div>

              <div className="flex rounded-full border border-champagne/40 bg-ivory/90 p-1 shadow-sm backdrop-blur-md">
                <button
                  type="button"
                  disabled={unsupported}
                  onClick={() => setMode("live")}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    mode === "live" ? "bg-maroon text-ivory" : "text-maroon/70",
                  )}
                  aria-label="Live camera"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode("photo")}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    mode === "photo" ? "bg-maroon text-ivory" : "text-maroon/70",
                  )}
                  aria-label="Use a photo"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom dock — single spaced row, clear of browser chrome / shop Filter */}
          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-champagne/25 bg-ivory/95 pt-3 shadow-[0_-8px_24px_rgba(43,35,28,0.06)] backdrop-blur-md pb-[max(0.85rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5 px-4">
              <div className="flex flex-wrap items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => setShowAfter((v) => !v)}
                  className={cn(
                    "min-w-[7.25rem] flex-1 rounded-full border px-3 py-2.5 font-body text-[10px] uppercase tracking-[0.14em] sm:text-[11px]",
                    showAfter
                      ? "border-champagne/40 bg-ivory text-maroon"
                      : "border-maroon/20 bg-maroon text-ivory",
                  )}
                  aria-pressed={showAfter}
                  title="Toggle jewellery overlay on the preview"
                >
                  {showAfter ? "Hide piece" : "Show piece"}
                </button>
                {mode === "photo" && (
                  <button
                    type="button"
                    onClick={() => setAdjustOpen((v) => !v)}
                    className="min-w-[7.25rem] flex-1 rounded-full border border-champagne/40 bg-ivory px-3 py-2.5 font-body text-[10px] uppercase tracking-[0.14em] text-maroon sm:text-[11px]"
                  >
                    Adjust
                  </button>
                )}
                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => {
                    void trackTryOnEvent("order_click", product.id);
                    onClose();
                  }}
                  className="inline-flex min-w-[7.25rem] flex-1 items-center justify-center gap-1.5 rounded-full bg-maroon px-3 py-2.5 font-body text-[10px] uppercase tracking-[0.14em] text-ivory shadow-sm sm:text-[11px]"
                >
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                  Order
                </Link>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="min-w-[7.25rem] flex-1 rounded-full border border-maroon/15 bg-linen px-3 py-2.5 font-body text-[10px] uppercase tracking-[0.14em] text-maroon sm:text-[11px]"
                >
                  Share
                </button>
              </div>

              {adjustOpen && mode === "photo" && (
                <div className="rounded-lg border border-champagne/30 bg-ivory p-3">
                  <ManualAdjustControls value={manual} onChange={setManual} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
