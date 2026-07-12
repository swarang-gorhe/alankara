import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { getAllProductSlugs, getProductPageData } from "@/lib/api/products";
import { getProductBySlug } from "@/lib/fixtures";

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
    return { title: "Product not found — Alankara" };
  }

  return {
    title: `${product.name} — Alankara`,
    description: product.shortDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getProductPageData(slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts, productReviews } = data;

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      productReviews={productReviews}
    />
  );
}
