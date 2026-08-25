export type TryOnType = "earring" | "necklace";

export type TryOnProduct = {
  id: string;
  slug: string;
  name: string;
  images: string[];
  categorySlug?: string;
  tryOnEnabled?: boolean;
  tryOnType?: TryOnType;
  /** @deprecated Prefer tryOnType */
  tryOnKind?: TryOnType;
  tryOnAssetUrl?: string | null;
  tryOnScale?: number;
  tryOnLeftOffsetX?: number;
  tryOnLeftOffsetY?: number;
  tryOnRightOffsetX?: number;
  tryOnRightOffsetY?: number;
  tryOnRotation?: number;
  tryOnVerticalOffset?: number;
  tryOnNecklaceAssetUrl?: string | null;
  tryOnNecklaceLengthOffset?: number;
  tryOnNecklaceScale?: number;
  tryOnNecklaceRotationOffset?: number;
};

export type EarAnchor = {
  x: number;
  y: number;
  visible: boolean;
};

export type EarAnchors = {
  kind: "earring" | "necklace";
  left: EarAnchor;
  right: EarAnchor;
  centerX: number;
  centerY: number;
  neckWidth: number;
  roll: number;
  yaw: number;
  scale: number;
  interocular: number;
};

/** Parallel necklace placement state — separate from EarAnchors. */
export type NecklaceAnchors = {
  /** Top of asset (clasp / back-of-neck) in normalized coords */
  claspX: number;
  claspY: number;
  /** Lagged pendant tip for drape sway */
  pendantX: number;
  pendantY: number;
  shoulderWidth: number;
  torsoRoll: number;
  yaw: number;
  scale: number;
  /** Chin/jaw polygon for occlusion mask */
  jawPoints: Array<{ x: number; y: number }>;
  visible: boolean;
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
