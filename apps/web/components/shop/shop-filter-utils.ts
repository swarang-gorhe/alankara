import type { EarringSize } from "@/lib/fixtures/shop";
import { EARRING_SIZES, PRICE_RANGES, SHOP_STYLE_FILTERS } from "@/lib/fixtures";
import type { CategorySlug, ShopFiltersState, StyleTag } from "@/lib/fixtures/types";

const VALID_CATEGORIES = new Set<CategorySlug>([
  "cloth-earrings",
  "fabric-necklaces",
  "fabric-bracelets",
  "fabric-rings",
  "hair-accessories",
  "jewellery-sets",
  "sustainable-fashion-accessories",
]);

const VALID_STYLES = new Set<StyleTag>(SHOP_STYLE_FILTERS);
const VALID_SIZES = new Set<string>(EARRING_SIZES);
const VALID_PRICE_RANGES = new Set(PRICE_RANGES.map((range) => range.id));

export const CATEGORY_OPTIONS: { slug: CategorySlug; label: string }[] = [
  { slug: "cloth-earrings", label: "Cloth Earrings" },
  { slug: "fabric-necklaces", label: "Necklaces" },
  { slug: "fabric-bracelets", label: "Bracelets" },
  { slug: "fabric-rings", label: "Rings" },
  { slug: "hair-accessories", label: "Hair" },
  { slug: "jewellery-sets", label: "Sets" },
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

export function parseSizeParam(value: string | null): EarringSize[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is EarringSize => VALID_SIZES.has(part));
}

export function filtersFromSearchParams(searchParams: URLSearchParams): ShopFiltersState {
  const price = searchParams.get("price");
  return {
    categories: parseCategoryParam(searchParams.get("category")),
    styles: parseStyleParam(searchParams.get("style")),
    sizes: parseSizeParam(searchParams.get("size")),
    priceRange:
      price && VALID_PRICE_RANGES.has(price as (typeof PRICE_RANGES)[number]["id"])
        ? (price as (typeof PRICE_RANGES)[number]["id"])
        : null,
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
  if (filters.sizes.length > 0) {
    params.set("size", filters.sizes.join(","));
  }
  if (filters.priceRange) {
    params.set("price", filters.priceRange);
  }
  return params.toString();
}

export function hasActiveFilters(filters: ShopFiltersState): boolean {
  return (
    filters.categories.length > 0 ||
    filters.styles.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange !== null
  );
}

export function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}
