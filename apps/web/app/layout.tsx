import type { Metadata } from "next";
import { Cormorant_Garamond, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CartProvider } from "@/components/providers/CartProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { LuxuryCursorProvider } from "@/components/providers/LuxuryCursorProvider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alankara — Crafted for little moments",
  description:
    "Luxury handcrafted jewellery and adornments. Artisan-made pieces for life's precious moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${sourceSans.variable}`}
    >
      <body className="min-h-screen bg-cream font-body text-charcoal antialiased">
        <LenisProvider>
          <LuxuryCursorProvider>
            <CartProvider>
              <SiteChrome>{children}</SiteChrome>
            </CartProvider>
          </LuxuryCursorProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
