import type { MaterialSlug, StyleTag } from "./types";

export const MATERIAL_LABELS: Record<MaterialSlug, string> = {
  embroidery: "Embroidery",
  pearls: "Pearls",
  cotton: "Cotton",
  "silk-thread": "Silk thread",
  zari: "Zari",
  ghungroos: "Ghungroos",
};

export const STYLE_LABELS: Record<StyleTag, string> = {
  embroidery: "Embroidery",
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
  "embroidery",
  "pearls",
  "cotton",
  "minimal",
  "statement",
  "boho",
  "earthy",
  "pastel",
  "traditional",
];
