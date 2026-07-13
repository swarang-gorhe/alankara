import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/fixtures";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "My Account",
  description: "Manage your Alankara orders, wishlist, addresses, and profile.",
  path: "/account",
});

const mockOrders = [
  {
    id: "ORD-2847",
    date: "12 Jun 2026",
    status: "Delivered",
    total: 7000,
    items: ["Chandni Fabric Jhumka", "Meera Pearl Choker"],
  },
  {
    id: "ORD-2712",
    date: "28 May 2026",
    status: "Shipped",
    total: 3200,
    items: ["Gajra Hair Pin"],
  },
];

const wishlistItems = [
  { name: "Noor Thread Haar", slug: "noor-thread-haar", price: 5600 },
  { name: "Sangam Bangle Set", slug: "sangam-bangle-set", price: 4800 },
];

const savedAddresses = [
  {
    label: "Home",
    name: "Priya Sharma",
    line: "14, Palm Grove Apartments, Koramangala 5th Block",
    city: "Bengaluru, Karnataka 560095",
    phone: "+91 98765 43210",
    default: true,
  },
  {
    label: "Work",
    name: "Priya Sharma",
    line: "WeWork Galaxy, Residency Road",
    city: "Bengaluru, Karnataka 560025",
    phone: "+91 98765 43210",
    default: false,
  },
];

export default function AccountPage() {
  return (
    <div className="bg-gradient-to-b from-ivory via-linen/40 to-cotton/30">
      <section className="border-b border-champagne/15 bg-ivory/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <p className="font-script text-xl italic text-champagne md:text-2xl">Your keepsake</p>
          <h1 className="mt-3 font-display text-3xl text-maroon md:text-5xl">My account</h1>
          <p className="mt-4 max-w-xl font-body text-ink-muted">
            Orders, wishlist, and delivery details — all in one place. Sign-in will connect here
            when authentication is live.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[240px_1fr] md:py-14">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1 rounded-sm border border-sage/25 bg-ivory/90 p-3 shadow-luxury">
            {[
              { href: "#orders", label: "Orders" },
              { href: "#wishlist", label: "Wishlist" },
              { href: "#addresses", label: "Addresses" },
              { href: "#profile", label: "Profile" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-sm px-4 py-2.5 font-body text-sm text-ink-muted transition-colors hover:bg-linen hover:text-maroon"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-12">
          <section id="profile" className="rounded-sm border border-sage/25 bg-ivory p-6 shadow-luxury md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-body text-xs uppercase tracking-widest text-olive">Profile</p>
                <h2 className="mt-2 font-display text-2xl text-maroon">Priya Sharma</h2>
                <p className="mt-1 font-body text-sm text-ink-muted">priya@example.com</p>
              </div>
              <Button variant="outline" size="sm" disabled title="Available when auth is wired">
                Edit profile
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Member since", value: "Jan 2026" },
                { label: "Orders", value: "2" },
                { label: "Wishlist", value: "2 pieces" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-sm border border-sage/20 bg-linen/50 px-4 py-3">
                  <p className="font-body text-[10px] uppercase tracking-widest text-olive">{stat.label}</p>
                  <p className="mt-1 font-display text-lg text-maroon">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="orders">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-body text-xs uppercase tracking-widest text-olive">Orders</p>
                <h2 className="mt-2 font-display text-2xl text-maroon">Recent orders</h2>
              </div>
            </div>
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-sm border border-sage/25 bg-ivory p-5 shadow-luxury transition-shadow hover:shadow-luxury-lg md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-xs uppercase tracking-widest text-champagne">{order.id}</p>
                      <p className="mt-1 font-body text-sm text-ink-muted">{order.date}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-body text-[10px] uppercase tracking-widest ${
                        order.status === "Delivered"
                          ? "bg-olive/15 text-olive"
                          : "bg-champagne/15 text-warm-brown"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-1">
                    {order.items.map((item) => (
                      <li key={item} className="font-body text-sm text-ink">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sage/20 pt-4">
                    <p className="font-display text-lg text-maroon">{formatPrice(order.total)}</p>
                    <Button variant="ghost" size="sm" disabled>
                      Track order
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="wishlist">
            <p className="font-body text-xs uppercase tracking-widest text-olive">Wishlist</p>
            <h2 className="mt-2 font-display text-2xl text-maroon">Saved pieces</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {wishlistItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  className="group flex items-center justify-between rounded-sm border border-sage/25 bg-ivory p-5 shadow-luxury transition-all hover:border-champagne/40 hover:shadow-luxury-lg"
                >
                  <div>
                    <p className="font-display text-lg text-maroon group-hover:text-warm-brown">{item.name}</p>
                    <p className="mt-1 font-body text-sm text-ink-muted">{formatPrice(item.price)}</p>
                  </div>
                  <span className="font-body text-xs uppercase tracking-widest text-champagne opacity-0 transition-opacity group-hover:opacity-100">
                    View →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section id="addresses">
            <p className="font-body text-xs uppercase tracking-widest text-olive">Addresses</p>
            <h2 className="mt-2 font-display text-2xl text-maroon">Delivery addresses</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {savedAddresses.map((address) => (
                <article
                  key={address.label}
                  className="relative rounded-sm border border-sage/25 bg-ivory p-5 shadow-luxury md:p-6"
                >
                  {address.default && (
                    <span className="absolute right-4 top-4 rounded-full bg-maroon/10 px-2.5 py-0.5 font-body text-[10px] uppercase tracking-widest text-maroon">
                      Default
                    </span>
                  )}
                  <p className="font-body text-xs uppercase tracking-widest text-champagne">{address.label}</p>
                  <p className="mt-2 font-display text-lg text-maroon">{address.name}</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{address.line}</p>
                  <p className="font-body text-sm text-ink-muted">{address.city}</p>
                  <p className="mt-2 font-body text-sm text-ink">{address.phone}</p>
                </article>
              ))}
            </div>
            <Button variant="outline" className="mt-6" disabled>
              Add new address
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
