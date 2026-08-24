"use client";

import Link from "next/link";
import { EditorialProductCard } from "@/components/shop/EditorialProductCard";
import { Button } from "@/components/ui/button";
import { FlowerDivider } from "@/components/brand/FlowerMotif";
import type { ProductFixture } from "@/lib/fixtures/types";

type HomeProductsProps = {
  products: ProductFixture[];
};

export function HomeProducts({ products }: HomeProductsProps) {
  const pieces = products.slice(0, 6);

  return (
    <section className="bg-ivory px-5 py-16 sm:px-8 md:py-24" aria-label="Little things we love">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.28em] text-olive">Shop</p>
          <h2 className="mt-3 font-display text-3xl text-maroon md:text-5xl">Little things we love</h2>
          <FlowerDivider className="mt-6" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-7">
          {pieces[0] && (
            <div className="lg:col-span-7">
              <EditorialProductCard product={pieces[0]} layout="feature" size="large" />
            </div>
          )}
          {pieces[1] && (
            <div className="lg:col-span-5">
              <EditorialProductCard product={pieces[1]} layout="portrait" />
            </div>
          )}
          {pieces[2] && (
            <div className="lg:col-span-4">
              <EditorialProductCard product={pieces[2]} layout="square" />
            </div>
          )}
          {pieces[3] && (
            <div className="lg:col-span-4">
              <EditorialProductCard product={pieces[3]} layout="square" />
            </div>
          )}
          <div className="flex flex-col justify-end lg:col-span-4">
            <p className="font-script text-2xl italic text-warm-brown">
              Bigger drops at ₹160. Smaller studs at ₹130.
            </p>
            <Button asChild variant="outline" className="mt-6 w-fit">
              <Link href="/shop">Shop all pieces</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
