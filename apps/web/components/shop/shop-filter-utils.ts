import type { CategorySlug, ShopFiltersState, StyleTag } from "@/lib/fixtures/types";
import { SHOP_STYLE_FILTERS } from "@/lib/fixtures";

const VALID_CATEGORIES = new Set<CategorySlug>([
  "cloth-earrings",
  "fabric-necklaces",
  "fabric-bracelets",
  "fabric-rings",
  "hair-accessories",
  "jewellery-sets",
  "embroidered-textile-jewellery",
  "sustainable-fashion-accessories",
]);

const VALID_STYLES = new Set<StyleTag>(SHOP_STYLE_FILTERS);

export const CATEGORY_OPTIONS: { slug: CategorySlug; label: string }[] = [
  { slug: "cloth-earrings", label: "Cloth Earrings" },
  { slug: "fabric-necklaces", label: "Necklaces" },
  { slug: "fabric-bracelets", label: "Bracelets" },
  { slug: "fabric-rings", label: "Rings" },
  { slug: "hair-accessories", label: "Hair" },
  { slug: "jewellery-sets", label: "Sets" },
  { slug: "embroidered-textile-jewellery", label: "Textile" },
  { slug: "sustainable-fashion-accessories", label: "Sustainable" },
];

export function parseCategoryParam(value: string | null): CategorySlug[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part): part is CategorySlug => VALID_CATEGORIES.has(part as CategorySlug));
}

export function parseStyleParam(value: string | null): StyleTag[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part): part is StyleTag => VALID_STYLES.has(part as StyleTag));
}

export function filtersFromSearchParams(searchParams: URLSearchParams): ShopFiltersState {
  return {
    categories: parseCategoryParam(searchParams.get("category")),
    styles: parseStyleParam(searchParams.get("style")),
    priceRange: null,
  };
}

export function filtersToQueryString(filters: ShopFiltersState): string {
  const params = new URLSearchParams();
  if (filters.categories.length > 0) {
    params.set("category", filters.categories.join(","));
  }
  if (filters.styles.length > 0) {
    params.set("style", filters.styles.join(","));
  }
  return params.toString();
}

export function hasActiveFilters(filters: ShopFiltersState): boolean {
  return filters.categories.length > 0 || filters.styles.length > 0 || filters.priceRange !== null;
}

export function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}
