"use client";

import { useRef, useState } from "react";
import { uploadAdminImage } from "@/lib/api/admin";
import { PRODUCT_PREFERRED, qualityWarning, type ImageRole } from "@/lib/media";
import { cn } from "@/lib/utils";

const SLOTS: { role: ImageRole; label: string }[] = [
  { role: "product", label: "Main" },
  { role: "gallery", label: "Gallery" },
  { role: "lifestyle", label: "Lifestyle" },
  { role: "thumbnail", label: "Thumbnail" },
  { role: "social", label: "Social" },
];

type Preview = {
  url: string;
  width: number;
  height: number;
  warning: string | null;
  role: ImageRole;
};

type AdminImageUploadProps = {
  images: string[];
  onChange: (images: string[]) => void;
  className?: string;
};

function inspectImage(file: File, role: ImageRole): Promise<Preview> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        warning: qualityWarning(img.naturalWidth, img.naturalHeight, role),
        role,
      });
    };
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = url;
  });
}

export function AdminImageUpload({ images, onChange, className }: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<ImageRole>("product");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, Preview>>({});

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const next = [...images];
    try {
      for (const file of Array.from(files)) {
        const preview = await inspectImage(file, role);
        const { url } = await uploadAdminImage(file);
        next.push(url);
        setMeta((prev) => ({ ...prev, [url]: { ...preview, url } }));
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {SLOTS.map((slot) => (
          <button
            key={slot.role}
            type="button"
            onClick={() => setRole(slot.role)}
            className={cn(
              "rounded border px-2 py-1 text-[10px] uppercase tracking-widest",
              role === slot.role
                ? "border-admin-accent text-admin-accent"
                : "border-admin-border text-admin-muted",
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {images.map((url) => {
          const info = meta[url];
          return (
            <div key={url} className="w-28 space-y-1">
              <div className="relative h-20 w-28 overflow-hidden rounded border border-admin-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-contain bg-admin-elevated" />
                <button
                  type="button"
                  onClick={() => onChange(images.filter((i) => i !== url))}
                  className="absolute right-0 top-0 bg-admin-danger px-1 text-[10px] text-white"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
              <p className="text-[10px] text-admin-muted">
                {info ? `${info.width} × ${info.height}px · ${info.role}` : "Uploaded"}
              </p>
              {info?.warning && <p className="text-[10px] text-admin-danger">{info.warning}</p>}
            </div>
          );
        })}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }}
          className="flex h-20 w-28 flex-col items-center justify-center rounded border border-dashed border-admin-border text-[10px] uppercase tracking-widest text-admin-muted hover:border-admin-accent/50"
        >
          {uploading ? "…" : `+ ${role}`}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-admin-danger">{error}</p>}
      <p className="text-[10px] text-admin-muted">
        Product images: minimum 1600 × 1600px. Recommended {PRODUCT_PREFERRED.width} ×{" "}
        {PRODUCT_PREFERRED.height}px. Lifestyle: 2000px wide. Hero: 2400px wide.
      </p>
    </div>
  );
}
