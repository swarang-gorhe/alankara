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
 * Lenskart-style full-bleed try-on: camera fills the screen,
 * chrome floats lightly, actions sit in a slim bottom dock.
 * Auto-selects earring vs necklace pipeline from product.tryOnType.
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
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, product.id]);

  useEffect(() => {
    if (unsupported) setMode("photo");
  }, [unsupported]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-ink"
      role="dialog"
      aria-modal="true"
      aria-label={`Try on ${product.name}`}
    >
      {/* Full-bleed stage */}
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
          {/* Top floating chrome */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-ink/55 via-ink/20 to-transparent pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="pointer-events-auto flex items-center justify-between px-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/45 text-ivory backdrop-blur-md"
                aria-label="Close try-on"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-3 min-w-0 flex-1 text-center">
                <p className="truncate font-display text-base text-ivory drop-shadow">{product.name}</p>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/70">
                  Try it on · private on device
                </p>
              </div>

              <div className="flex rounded-full bg-ink/45 p-1 backdrop-blur-md">
                <button
                  type="button"
                  disabled={unsupported}
                  onClick={() => setMode("live")}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    mode === "live" ? "bg-ivory text-maroon" : "text-ivory/80",
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
                    mode === "photo" ? "bg-ivory text-maroon" : "text-ivory/80",
                  )}
                  aria-label="Use a photo"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom dock */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/70 via-ink/35 to-transparent pt-20 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto flex max-w-lg flex-col gap-3 px-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAfter((v) => !v)}
                  className={cn(
                    "rounded-full px-4 py-2.5 font-body text-[11px] uppercase tracking-[0.16em] backdrop-blur-md",
                    showAfter
                      ? "bg-ivory/20 text-ivory"
                      : "bg-ivory text-maroon",
                  )}
                >
                  {showAfter ? "Hide" : "Show"}
                </button>
                {mode === "photo" && (
                  <button
                    type="button"
                    onClick={() => setAdjustOpen((v) => !v)}
                    className="rounded-full bg-ivory/20 px-4 py-2.5 font-body text-[11px] uppercase tracking-[0.16em] text-ivory backdrop-blur-md"
                  >
                    Adjust
                  </button>
                )}
                <div className="flex-1" />
                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => {
                    void trackTryOnEvent("order_click", product.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.16em] text-ivory shadow-lg"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Order
                </Link>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="rounded-full bg-ivory px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.16em] text-maroon shadow-lg"
                >
                  Share
                </button>
              </div>

              {adjustOpen && mode === "photo" && (
                <div className="rounded-lg bg-ivory/95 p-3 backdrop-blur-md">
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
