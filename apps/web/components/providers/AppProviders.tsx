"use client";

import type { ReactNode } from "react";
import { IntroProvider } from "@/contexts/IntroContext";
import { CartProvider } from "@/components/providers/CartProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { LuxuryCursorProvider } from "@/components/providers/LuxuryCursorProvider";
import { SiteChrome } from "@/components/layout/SiteChrome";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <IntroProvider>
      <LenisProvider>
        <LuxuryCursorProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </LuxuryCursorProvider>
      </LenisProvider>
    </IntroProvider>
  );
}
