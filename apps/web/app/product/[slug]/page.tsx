import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import {
  getProductBySlug,
  getRelatedProducts,
  getReviewsForProduct,
  products,
} from "@/lib/fixtures";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.relatedSlugs);
  const productReviews = getReviewsForProduct(product.id);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      productReviews={productReviews}
    />
  );
}
