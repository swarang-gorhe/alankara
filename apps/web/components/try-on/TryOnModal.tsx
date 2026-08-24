"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BeforeAfterToggle } from "./BeforeAfterToggle";
import { LiveCameraView } from "./LiveCameraView";
import { ManualAdjustControls } from "./ManualAdjustControls";
import { ModeTabs } from "./ModeTabs";
import { PhotoUploadView } from "./PhotoUploadView";
import { ShareMyLookForm } from "./ShareMyLookForm";
import { TryOnHeader } from "./TryOnHeader";
import { useFaceLandmarker } from "./useFaceLandmarker";
import { trackTryOnEvent } from "./tryOnAnalytics";
import type { ManualAdjust, TryOnMode, TryOnProduct } from "./types";
import { DEFAULT_MANUAL_ADJUST } from "./types";
import { BRAND_INSTAGRAM_URL } from "@/lib/brand/contact";

type TryOnModalProps = {
  open: boolean;
  product: TryOnProduct;
  onClose: () => void;
};

export function TryOnModal({ open, product, onClose }: TryOnModalProps) {
  const [mode, setMode] = useState<TryOnMode>("live");
  const [manual, setManual] = useState<ManualAdjust>(DEFAULT_MANUAL_ADJUST);
  const [showAfter, setShowAfter] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const { ready, unsupported, detectVideo, detectImage } = useFaceLandmarker();

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

  const downloadLook = () => {
    if (!photoDataUrl) return;
    const a = document.createElement("a");
    a.href = photoDataUrl;
    a.download = `alankara-try-on-${product.slug}.jpg`;
    a.click();
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Trying on ${product.name} at Alankara — ${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.slug}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-ink/50 p-0 sm:items-center sm:p-6">
      <div
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-ivory shadow-luxury-lg sm:h-[min(92vh,840px)]"
        role="dialog"
        aria-modal="true"
        aria-label={`Try on ${product.name}`}
      >
        <TryOnHeader productName={product.name} onClose={onClose} />

        <div className="border-b border-champagne/25 px-4 py-3">
          <ModeTabs
            mode={mode}
            onChange={(m) => {
              setMode(m);
              if (m !== mode) void trackTryOnEvent("product_change", product.id);
            }}
            liveDisabled={unsupported}
          />
          <p className="mt-2 font-body text-[11px] text-ink-muted">
            Face detection runs on your device. Nothing is uploaded until you share.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 bg-linen">
          {shareOpen ? (
            <ShareMyLookForm
              product={product}
              photoDataUrl={photoDataUrl}
              onClose={() => setShareOpen(false)}
            />
          ) : mode === "live" ? (
            <LiveCameraView
              product={product}
              detectVideo={detectVideo}
              landmarkerReady={ready}
              unsupported={unsupported}
              onSwitchPhoto={() => setMode("photo")}
              manual={manual}
              showOverlay={showAfter}
            />
          ) : (
            <PhotoUploadView
              product={product}
              detectImage={detectImage}
              landmarkerReady={ready}
              manual={manual}
              showOverlay={showAfter}
              onPhotoReady={setPhotoDataUrl}
            />
          )}
        </div>

        {!shareOpen && (
          <div className="space-y-3 border-t border-champagne/30 bg-ivory px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <BeforeAfterToggle showAfter={showAfter} onChange={setShowAfter} />
              <div className="ml-auto flex flex-wrap gap-2">
                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => {
                    void trackTryOnEvent("order_click", product.id);
                    onClose();
                  }}
                  className="bg-maroon px-3 py-2 font-body text-[10px] uppercase tracking-widest text-ivory"
                >
                  Order This
                </Link>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="border border-maroon/40 px-3 py-2 font-body text-[10px] uppercase tracking-widest text-maroon"
                >
                  Share My Look
                </button>
              </div>
            </div>
            {mode === "photo" && (
              <ManualAdjustControls value={manual} onChange={setManual} />
            )}
            <div className="flex flex-wrap gap-3 font-body text-[10px] uppercase tracking-widest text-olive">
              <button type="button" onClick={downloadLook} disabled={!photoDataUrl}>
                Download
              </button>
              <button type="button" onClick={shareWhatsApp}>
                WhatsApp
              </button>
              <a href={BRAND_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
