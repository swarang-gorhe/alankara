import type { MaterialSlug, StyleTag } from "./types";

export const MATERIAL_LABELS: Record<MaterialSlug, string> = {
  pearls: "Pearls",
  cotton: "Cotton",
  "silk-thread": "Silk thread",
  zari: "Zari",
  ghungroos: "Ghungroos",
};

export const STYLE_LABELS: Record<StyleTag, string> = {
  pearls: "Pearls",
  cotton: "Cotton",
  minimal: "Minimal",
  statement: "Statement",
  boho: "Boho",
  earthy: "Earthy",
  pastel: "Pastel",
  traditional: "Traditional",
};

export const SHOP_STYLE_FILTERS: StyleTag[] = [
  "statement",
  "minimal",
  "earthy",
  "traditional",
  "pearls",
  "cotton",
  "boho",
  "pastel",
];

export const EARRING_SIZES = ["Bigger", "Smaller"] as const;

export type EarringSize = (typeof EARRING_SIZES)[number];
