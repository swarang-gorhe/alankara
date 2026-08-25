import type { TryOnProduct, TryOnType } from "./types";

export type TrimBounds = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export type TryOnKind = TryOnType;

export function getTryOnType(product: TryOnProduct): TryOnType {
  if (product.tryOnType === "necklace" || product.tryOnType === "earring") {
    return product.tryOnType;
  }
  if (product.tryOnKind === "necklace" || product.tryOnKind === "earring") {
    return product.tryOnKind;
  }
  if (product.categorySlug?.includes("necklace")) return "necklace";
  return "earring";
}

/** @deprecated Prefer getTryOnType */
export function getTryOnKind(product: TryOnProduct): TryOnKind {
  return getTryOnType(product);
}

/** Transparent cutout URL — never fall back to catalog product photos. */
export function getTryOnAssetUrl(product: TryOnProduct): string | null {
  const type = getTryOnType(product);
  if (type === "necklace") {
    if (product.tryOnNecklaceAssetUrl) return product.tryOnNecklaceAssetUrl;
    if (product.tryOnAssetUrl) return product.tryOnAssetUrl;
    if (product.tryOnEnabled && product.slug) return `/try-on/${product.slug}.png`;
    return null;
  }
  if (product.tryOnAssetUrl) return product.tryOnAssetUrl;
  if (product.tryOnEnabled && product.slug) return `/try-on/${product.slug}.png`;
  return null;
}

/** Only show try-on when enabled with a real cutout asset. */
export function hasTryOnAsset(product: TryOnProduct): boolean {
  return Boolean(product.tryOnEnabled && getTryOnAssetUrl(product));
}

/** Crop to non-transparent pixels so only the jewellery is drawn. */
export function computeAlphaBounds(
  img: HTMLImageElement,
  threshold = 16,
): TrimBounds | null {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  let x0 = w;
  let y0 = h;
  let x1 = 0;
  let y1 = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > threshold) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }

  if (x1 < x0) return null;

  const pad = Math.max(2, Math.round(Math.max(x1 - x0, y1 - y0) * 0.02));
  const sx = Math.max(0, x0 - pad);
  const sy = Math.max(0, y0 - pad);
  const sw = Math.min(w, x1 + pad + 1) - sx;
  const sh = Math.min(h, y1 + pad + 1) - sy;

  return { sx, sy, sw, sh };
}
