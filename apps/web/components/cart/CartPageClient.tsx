"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { ProductPlaceholder } from "@/components/product/ProductPlaceholder";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

export function CartPageClient() {
  const { cart, loading, error, updateQuantity, removeItem } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    setBusyId(itemId);
    try {
      await updateQuantity(itemId, quantity);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center text-charcoal-muted">
        Loading your cart…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-widest text-gold">Your selection</p>
      <h1 className="mt-2 font-display text-4xl text-maroon">Shopping cart</h1>

      {error && (
        <p className="mt-6 rounded-sm border border-maroon/30 bg-cream-light px-4 py-3 text-sm text-maroon">
          {error}
        </p>
      )}

      {!cart || cart.items.length === 0 ? (
        <div className="mt-12 rounded-sm border border-gold/20 bg-cream-light px-8 py-16 text-center">
          <p className="text-lg text-charcoal-muted">Your cart is empty.</p>
          <Button asChild className="mt-6">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-gold/15">
            {cart.items.map((item) => (
              <li key={item.id} className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center">
                <Link
                  href={`/product/${item.productSlug}`}
                  className="w-full shrink-0 overflow-hidden rounded-sm border border-gold/20 sm:w-32"
                >
                  <ProductPlaceholder
                    name={item.productName}
                    image={item.image ?? undefined}
                    aspectRatio="square"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="font-display text-xl text-maroon hover:text-maroon-light"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm text-charcoal-muted">{item.variantLabel}</p>
                  <p className="mt-2 font-display text-lg text-maroon">
                    {formatPrice(item.unitPrice.amount)}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-sm border border-gold/30">
                    <button
                      type="button"
                      disabled={busyId === item.id || item.quantity <= 1}
                      onClick={() => void handleQuantityChange(item.id, item.quantity - 1)}
                      className="px-3 py-2 text-charcoal hover:bg-cream-light disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={busyId === item.id || item.quantity >= item.stock}
                      onClick={() => void handleQuantityChange(item.id, item.quantity + 1)}
                      className="px-3 py-2 text-charcoal hover:bg-cream-light disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-medium text-charcoal">
                    {formatPrice(item.lineTotal.amount)}
                  </p>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void handleRemove(item.id)}
                    className={cn(
                      "text-xs uppercase tracking-widest text-charcoal-muted hover:text-maroon",
                      busyId === item.id && "opacity-50",
                    )}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <SectionDivider className="my-10" />

          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-charcoal-muted">Subtotal</p>
              <p className="font-display text-3xl text-maroon">
                {formatPrice(cart.subtotal.amount)}
              </p>
              <p className="mt-1 text-xs text-charcoal-muted">
                Shipping &amp; taxes calculated at checkout
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
