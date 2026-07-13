"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchMyOrders,
  type Address,
} from "@/lib/api/account";
import { fetchWishlist, removeWishlistItem, type WishlistItem } from "@/lib/api/wishlist";
import { formatPrice } from "@/lib/fixtures";
import { API_URL } from "@/lib/api/client";

export function AccountPageClient() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchMyOrders>>>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/account");
      return;
    }
    if (!API_URL) {
      setError("API not configured");
      setLoading(false);
      return;
    }
    Promise.all([fetchMyOrders(), fetchAddresses(), fetchWishlist()])
      .then(([o, a, w]) => {
        setOrders(o);
        setAddresses(a);
        setWishlist(w);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load account"))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleAddAddress = async () => {
    const addr = await createAddress({
      name: user?.email.split("@")[0] ?? "Guest",
      email: user?.email ?? "",
      line1: "14, Palm Grove Apartments",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560095",
      country: "IN",
    });
    setAddresses((prev) => [addr, ...prev]);
  };

  if (authLoading || loading) {
    return <p className="px-6 py-20 text-center font-body text-ink-muted">Loading account…</p>;
  }

  if (error) {
    return <p className="px-6 py-20 text-center font-body text-error">{error}</p>;
  }

  return (
    <div className="bg-ivory">
      <section className="border-b border-champagne/15 px-6 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl text-maroon md:text-5xl">My account</h1>
          <p className="mt-3 font-body text-ink-muted">{user?.email}</p>
          <Button variant="outline" className="mt-6" onClick={() => signOut().then(() => router.push("/"))}>
            Sign out
          </Button>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 md:py-16">
        <section id="orders">
          <h2 className="font-display text-2xl text-maroon">Orders</h2>
          {orders.length === 0 ? (
            <p className="mt-4 font-body text-sm text-ink-muted">No orders yet.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-sm border border-sage/25 bg-cotton/30 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-body text-sm uppercase tracking-widest text-olive">
                      {order.id}
                    </span>
                    <span className="font-body text-xs text-ink-muted">{order.status}</span>
                  </div>
                  <p className="mt-2 font-display text-lg text-maroon">
                    {formatPrice(order.total.amount)}
                  </p>
                  <p className="mt-1 font-body text-sm text-ink-muted">
                    {order.items.map((i) => i.productName).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="wishlist">
          <h2 className="font-display text-2xl text-maroon">Wishlist</h2>
          {wishlist.length === 0 ? (
            <p className="mt-4 font-body text-sm text-ink-muted">Your wishlist is empty.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {wishlist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-sm border border-sage/25 p-4"
                >
                  <Link href={`/product/${item.productSlug}`} className="font-body text-maroon hover:underline">
                    {item.productName}
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeWishlistItem(item.id).then(() =>
                        setWishlist((w) => w.filter((x) => x.id !== item.id)),
                      )
                    }
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="addresses">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl text-maroon">Addresses</h2>
            <Button variant="outline" size="sm" onClick={() => void handleAddAddress()}>
              Add address
            </Button>
          </div>
          {addresses.length === 0 ? (
            <p className="mt-4 font-body text-sm text-ink-muted">No saved addresses.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {addresses.map((addr) => (
                <li key={addr.id} className="rounded-sm border border-sage/25 p-5">
                  <p className="font-body font-medium text-ink">{addr.name}</p>
                  <p className="mt-1 font-body text-sm text-ink-muted">
                    {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => deleteAddress(addr.id).then(() => setAddresses((a) => a.filter((x) => x.id !== addr.id)))}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
