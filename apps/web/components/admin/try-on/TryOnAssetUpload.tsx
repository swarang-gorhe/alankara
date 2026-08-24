"use client";

import { useRef, useState } from "react";
import { uploadAdminImage } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type TryOnAssetUploadProps = {
  url: string | null | undefined;
  onChange: (url: string | null) => void;
  className?: string;
};

export function TryOnAssetUpload({ url, onChange, className }: TryOnAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url: uploaded } = await uploadAdminImage(file);
      onChange(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded border border-admin-border bg-admin-elevated">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Try-on asset" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="px-3 text-center text-[10px] uppercase tracking-widest text-admin-muted">
              Transparent PNG / WebP
            </span>
          )}
        </div>
        <div className="space-y-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded border border-admin-border px-3 py-2 text-xs uppercase tracking-widest text-admin-accent hover:border-admin-accent disabled:opacity-50"
          >
            {uploading ? "Uploading…" : url ? "Replace asset" : "Upload asset"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="block text-xs uppercase tracking-widest text-admin-danger"
            >
              Remove
            </button>
          )}
          <p className="max-w-xs text-[11px] text-admin-muted">
            Use the approved product cutout on a transparent background. Do not upload AI-generated
            jewellery imagery.
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      {error && <p className="text-xs text-admin-danger">{error}</p>}
    </div>
  );
}
