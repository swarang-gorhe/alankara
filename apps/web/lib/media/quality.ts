/** Image quality gates — never enlarge a small asset to a large display size. */

export const PRODUCT_MIN = { width: 1600, height: 1600 };
export const PRODUCT_PREFERRED = { width: 2000, height: 2000 };
export const HERO_MIN_WIDTH = 2400;
export const LIFESTYLE_MIN_WIDTH = 2000;

export type FitMode = "contain" | "cover";

export type ImageRole =
  | "product"
  | "gallery"
  | "thumbnail"
  | "lifestyle"
  | "detail"
  | "hero"
  | "social";

export function qualityWarning(width: number, height: number, role: ImageRole): string | null {
  if (role === "product" || role === "gallery" || role === "thumbnail") {
    if (width < PRODUCT_MIN.width || height < PRODUCT_MIN.height) {
      return `Image resolution is too low (${width} × ${height}px). Recommended: ${PRODUCT_PREFERRED.width} × ${PRODUCT_PREFERRED.height}px.`;
    }
  }
  if (role === "hero" && width < HERO_MIN_WIDTH) {
    return `Hero image is too narrow (${width}px). Minimum: ${HERO_MIN_WIDTH}px wide.`;
  }
  if ((role === "lifestyle" || role === "detail" || role === "social") && width < LIFESTYLE_MIN_WIDTH) {
    return `Lifestyle image is too narrow (${width}px). Minimum: ${LIFESTYLE_MIN_WIDTH}px wide.`;
  }
  return null;
}

export function isProductFit(role: ImageRole): FitMode {
  return role === "product" || role === "gallery" || role === "thumbnail" ? "contain" : "cover";
}
