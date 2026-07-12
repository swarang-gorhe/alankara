"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/button";
import { checkout, type CheckoutResponse, type ShippingAddress } from "@/lib/api/cart";
import { formatPrice } from "@/lib/fixtures";
import { initiatePaymentFromCheckoutResponse } from "@/lib/checkout/payment";

const emptyAddress: ShippingAddress = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
};

export function CheckoutPageClient() {
  const router = useRouter();
  const { cart, loading, refresh } = useCart();
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<CheckoutResponse | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await checkout(address);
      const payment = await initiatePaymentFromCheckoutResponse(result.payment);
      setCompleted(result);
      setPaymentMessage(payment.message ?? null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 text-center text-charcoal-muted">
        Loading checkout…
      </div>
    );
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-widest text-gold">Order placed</p>
        <h1 className="mt-2 font-display text-4xl text-maroon">Thank you</h1>
        <p className="mt-4 text-charcoal-muted">
          Order <span className="font-medium text-charcoal">{completed.order.id}</span> is saved
          with status <span className="italic">pending payment</span>.
        </p>
        {paymentMessage && (
          <div className="mt-8 rounded-sm border border-dashed border-gold/40 bg-cream-light px-6 py-4 text-sm text-charcoal-muted">
            {paymentMessage}
          </div>
        )}
        <div className="mt-10 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/shop">Continue shopping</Link>
          </Button>
          <Button asChild>
            <Link href="/account">View account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-maroon">Nothing to checkout</h1>
        <p className="mt-4 text-charcoal-muted">Your cart is empty.</p>
        <Button asChild className="mt-8">
          <Link href="/shop">Browse the collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <p className="text-xs uppercase tracking-widest text-gold">Secure checkout</p>
      <h1 className="mt-2 font-display text-4xl text-maroon">Complete your order</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-5">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 lg:col-span-3">
          <fieldset className="space-y-4">
            <legend className="font-display text-xl text-maroon">Shipping address</legend>

            {(
              [
                ["name", "Full name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone (optional)", "tel"],
                ["line1", "Address line 1", "text"],
                ["line2", "Address line 2 (optional)", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["postalCode", "Postal code", "text"],
              ] as const
            ).map(([field, label, type]) => (
              <label key={field} className="block">
                <span className="text-xs uppercase tracking-widest text-charcoal-muted">
                  {label}
                </span>
                <input
                  type={type}
                  required={!field.includes("optional") && field !== "phone" && field !== "line2"}
                  value={address[field] ?? ""}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="mt-1 w-full rounded-sm border border-gold/30 bg-cream-light px-4 py-3 text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </label>
            ))}
          </fieldset>

          <div className="rounded-sm border border-dashed border-gold/40 bg-olive-linen/30 px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-gold">Payment</p>
            <p className="mt-2 text-sm text-charcoal-muted">
              Stripe / Razorpay integration coming soon. Placing this order saves it as{" "}
              <em>pending payment</em> — no charge today.
            </p>
          </div>

          {error && (
            <p className="rounded-sm border border-maroon/30 bg-cream-light px-4 py-3 text-sm text-maroon">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Placing order…" : "Place order (test mode)"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/cart")}>
              Back to cart
            </Button>
          </div>
        </form>

        <aside className="lg:col-span-2">
          <div className="rounded-sm border border-gold/20 bg-cream-light p-6">
            <h2 className="font-display text-xl text-maroon">Order summary</h2>
            <ul className="mt-6 space-y-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-charcoal">
                    {item.productName}
                    <span className="block text-charcoal-muted">
                      {item.variantLabel} × {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(item.lineTotal.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <SectionDivider className="my-6" />
            <div className="flex justify-between font-display text-lg text-maroon">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal.amount)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
