import type { Metadata } from "next";

const SITE_NAME = "Alankara";
const DEFAULT_DESCRIPTION =
  "Luxury handcrafted jewellery and adornments. Artisan-made pieces for life's precious moments.";

const DEFAULT_SITE_URL = "https://alankara.com";

function normalizeSiteUrl(candidate: string | undefined): string | null {
  const trimmed = candidate?.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Canonical site origin for SEO metadata, sitemap, and robots.
 * Falls back to VERCEL_URL on preview deployments when NEXT_PUBLIC_SITE_URL is unset or invalid.
 */
export function getSiteUrl(): string {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ) ??
    DEFAULT_SITE_URL
  );
}

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = "/brand/logo.svg",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ url: imageUrl, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  }),
  title: {
    default: `${SITE_NAME} — Crafted for little moments`,
    template: `%s — ${SITE_NAME}`,
  },
};
