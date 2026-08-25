export type TryOnProduct = {
  id: string;
  slug: string;
  name: string;
  images: string[];
  categorySlug?: string;
  tryOnEnabled?: boolean;
  tryOnAssetUrl?: string | null;
  tryOnKind?: "earring" | "necklace";
  tryOnScale?: number;
  tryOnLeftOffsetX?: number;
  tryOnLeftOffsetY?: number;
  tryOnRightOffsetX?: number;
  tryOnRightOffsetY?: number;
  tryOnRotation?: number;
  tryOnVerticalOffset?: number;
};

export type EarAnchor = {
  x: number; // 0–1 normalized
  y: number;
  visible: boolean;
};

export type EarAnchors = {
  kind: "earring" | "necklace";
  left: EarAnchor;
  right: EarAnchor;
  /** Necklace center in normalized coords */
  centerX: number;
  centerY: number;
  /** Necklace width in normalized face space */
  neckWidth: number;
  roll: number; // radians
  yaw: number;
  scale: number; // relative to interocular distance
  interocular: number;
};

export type ManualAdjust = {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  zoom: number;
};

export const DEFAULT_MANUAL_ADJUST: ManualAdjust = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  zoom: 1,
};

export type TryOnMode = "live" | "photo";

export type TryOnErrorKind =
  | "camera_denied"
  | "no_face"
  | "poor_lighting"
  | "one_ear"
  | "unsupported"
  | "generic";
