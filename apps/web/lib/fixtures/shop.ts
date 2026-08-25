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
];

export const EARRING_SIZES = ["Bigger", "Smaller"] as const;

export type EarringSize = (typeof EARRING_SIZES)[number];

export const SHOP_MATERIAL_FILTERS: MaterialSlug[] = ["cotton", "pearls", "ghungroos"];

export const COLOR_OPTIONS = [
  "Mustard & burgundy",
  "Cocoa & ivory",
  "Forest green",
  "Burgundy",
  "Ivory pearl",
  "Blush & sage",
  "Warm gold",
  "Festive mix",
] as const;

export const COLLECTION_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "bigger", label: "Bigger earrings" },
  { id: "smaller", label: "Smaller earrings" },
] as const;

export const EMPTY_SHOP_FILTERS = {
  categories: [] as const,
  styles: [] as const,
  sizes: [] as const,
  priceRange: null,
  materials: [] as const,
  colors: [] as const,
  availability: "all" as const,
  collections: [] as const,
};
