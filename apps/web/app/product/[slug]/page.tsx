import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { getAllProductSlugs, getProductPageData } from "@/lib/api/products";
import { getProductBySlug } from "@/lib/fixtures";
import { createPageMetadata } from "@/lib/seo/metadata";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductPageData(slug);
  const product = data?.product ?? getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return createPageMetadata({
    title: product.name,
    description: product.shortDescription ?? product.description,
    path: `/product/${slug}`,
    image: product.images[0] ?? "/brand/logo.svg",
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getProductPageData(slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts, productReviews } = data;

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        productReviews={productReviews}
      />
    </>
  );
}
