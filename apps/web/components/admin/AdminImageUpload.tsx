"use client";

import { useRef, useState } from "react";
import { uploadAdminImage } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type AdminImageUploadProps = {
  images: string[];
  onChange: (images: string[]) => void;
  className?: string;
};

export function AdminImageUpload({ images, onChange, className }: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const next = [...images];
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadAdminImage(file);
        next.push(url);
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
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded border border-admin-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((i) => i !== url))}
              className="absolute right-0 top-0 bg-admin-danger px-1 text-[10px] text-white"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }}
          className="flex h-20 w-20 flex-col items-center justify-center rounded border border-dashed border-admin-border text-[10px] uppercase tracking-widest text-admin-muted hover:border-admin-accent/50"
        >
          {uploading ? "…" : "+ Add"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-admin-danger">{error}</p>}
      <p className="text-[10px] text-admin-muted">Drag & drop or click to upload (max 10MB)</p>
    </div>
  );
}
