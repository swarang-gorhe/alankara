import type { ProductFixture } from "@/lib/fixtures/types";
import { getSiteUrl } from "@/lib/seo/metadata";

type ProductJsonLdProps = {
  product: ProductFixture;
};

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const siteUrl = getSiteUrl();
  const price = product.variants[0]?.price;
  const image = product.images[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    url: `${siteUrl}/product/${product.slug}`,
    image: image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : undefined,
    brand: {
      "@type": "Brand",
      name: "Alankara",
    },
    offers: price
      ? {
          "@type": "Offer",
          priceCurrency: price.currency,
          price: (price.amount / 100).toFixed(2),
          availability:
            product.variants.some((v) => v.stock > 0)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${siteUrl}/product/${product.slug}`,
        }
      : undefined,
    material: product.materials?.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
