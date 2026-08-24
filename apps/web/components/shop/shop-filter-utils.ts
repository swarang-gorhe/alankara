import type { EarringSize } from "@/lib/fixtures/shop";
import {
  COLOR_OPTIONS,
  COLLECTION_OPTIONS,
  EARRING_SIZES,
  PRICE_RANGES,
  SHOP_MATERIAL_FILTERS,
  SHOP_STYLE_FILTERS,
} from "@/lib/fixtures";
import type { CategorySlug, MaterialSlug, ShopFiltersState, StyleTag } from "@/lib/fixtures/types";

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
const VALID_MATERIALS = new Set<MaterialSlug>(SHOP_MATERIAL_FILTERS);
const VALID_COLORS = new Set<string>(COLOR_OPTIONS);
const VALID_COLLECTIONS = new Set(COLLECTION_OPTIONS.map((c) => c.id));

export const CATEGORY_OPTIONS: { slug: CategorySlug; label: string }[] = [
  { slug: "cloth-earrings", label: "Cloth Earrings" },
  { slug: "fabric-necklaces", label: "Necklaces" },
  { slug: "fabric-bracelets", label: "Bracelets" },
  { slug: "fabric-rings", label: "Rings" },
  { slug: "hair-accessories", label: "Hair" },
  { slug: "jewellery-sets", label: "Sets" },
  { slug: "sustainable-fashion-accessories", label: "Sustainable" },
];

export const EMPTY_FILTERS: ShopFiltersState = {
  categories: [],
  styles: [],
  sizes: [],
  priceRange: null,
  materials: [],
  colors: [],
  availability: "all",
  collections: [],
};

function parseList<T extends string>(value: string | null, valid: Set<T>): T[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is T => valid.has(part as T));
}

export function filtersFromSearchParams(searchParams: URLSearchParams): ShopFiltersState {
  const price = searchParams.get("price");
  const availability = searchParams.get("availability");
  return {
    categories: parseList(searchParams.get("category"), VALID_CATEGORIES),
    styles: parseList(searchParams.get("style")?.toLowerCase() ?? null, VALID_STYLES),
    sizes: parseList(searchParams.get("size"), VALID_SIZES) as EarringSize[],
    priceRange:
      price && VALID_PRICE_RANGES.has(price as (typeof PRICE_RANGES)[number]["id"])
        ? (price as (typeof PRICE_RANGES)[number]["id"])
        : null,
    materials: parseList(searchParams.get("material"), VALID_MATERIALS),
    colors: parseList(searchParams.get("color"), VALID_COLORS),
    availability: availability === "in-stock" ? "in-stock" : "all",
    collections: parseList(searchParams.get("collection"), VALID_COLLECTIONS),
  };
}

export function filtersToQueryString(filters: ShopFiltersState): string {
  const params = new URLSearchParams();
  if (filters.categories.length > 0) params.set("category", filters.categories.join(","));
  if (filters.styles.length > 0) params.set("style", filters.styles.join(","));
  if (filters.sizes.length > 0) params.set("size", filters.sizes.join(","));
  if (filters.priceRange) params.set("price", filters.priceRange);
  if (filters.materials.length > 0) params.set("material", filters.materials.join(","));
  if (filters.colors.length > 0) params.set("color", filters.colors.join(","));
  if (filters.availability === "in-stock") params.set("availability", "in-stock");
  if (filters.collections.length > 0) params.set("collection", filters.collections.join(","));
  return params.toString();
}

export function hasActiveFilters(filters: ShopFiltersState): boolean {
  return (
    filters.categories.length > 0 ||
    filters.styles.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange !== null ||
    (filters.materials?.length ?? 0) > 0 ||
    (filters.colors?.length ?? 0) > 0 ||
    filters.availability === "in-stock" ||
    (filters.collections?.length ?? 0) > 0
  );
}

export function activeFilterCount(filters: ShopFiltersState): number {
  return (
    filters.categories.length +
    filters.styles.length +
    filters.sizes.length +
    (filters.priceRange ? 1 : 0) +
    (filters.materials?.length ?? 0) +
    (filters.colors?.length ?? 0) +
    (filters.availability === "in-stock" ? 1 : 0) +
    (filters.collections?.length ?? 0)
  );
}

export function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function filterProducts(
  products: import("@/lib/fixtures/types").ProductFixture[],
  filters: ShopFiltersState,
) {
  return products.filter((product) => {
    if (filters.categories.length > 0 && !filters.categories.includes(product.categorySlug)) {
      return false;
    }
    if (
      filters.styles.length > 0 &&
      !filters.styles.some((style) => (product.styleTags ?? []).includes(style))
    ) {
      return false;
    }
    if (
      (filters.sizes ?? []).length > 0 &&
      !filters.sizes.some((size) =>
        (product.variants ?? []).some((variant) => variant.size === size),
      )
    ) {
      return false;
    }
    if (filters.priceRange) {
      const range = PRICE_RANGES.find((r) => r.id === filters.priceRange);
      if (range && (product.minPrice < range.min || product.minPrice > range.max)) {
        return false;
      }
    }
    if (
      (filters.materials ?? []).length > 0 &&
      !filters.materials.includes(product.primaryMaterial)
    ) {
      return false;
    }
    if ((filters.colors ?? []).length > 0) {
      const colors = (product.variants ?? []).map((v) => v.color).filter(Boolean);
      if (!filters.colors.some((c) => colors.includes(c))) return false;
    }
    if (filters.availability === "in-stock") {
      const stock = (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0);
      if (stock <= 0) return false;
    }
    if ((filters.collections ?? []).length > 0) {
      const ids: string[] = [];
      if (product.featured) ids.push("featured");
      if ((product.variants ?? []).some((v) => v.size === "Bigger")) ids.push("bigger");
      if ((product.variants ?? []).some((v) => v.size === "Smaller")) ids.push("smaller");
      if (!filters.collections.some((id) => ids.includes(id))) return false;
    }
    return true;
  });
}
