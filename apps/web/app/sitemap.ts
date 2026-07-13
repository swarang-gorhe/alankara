import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/api/products";
import { getSiteUrl } from "@/lib/seo/metadata";

const STATIC_ROUTES = [
  "",
  "/shop",
  "/reviews",
  "/our-story",
  "/artisans",
  "/account",
  "/cart",
  "/checkout",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.7,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllProductSlugs();
    productEntries = slugs.map((slug) => ({
      url: `${siteUrl}/product/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // API unavailable at build time — static routes still emitted.
  }

  return [...staticEntries, ...productEntries];
}
