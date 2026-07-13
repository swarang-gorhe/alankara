"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";
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
      <AuthProvider>
        <LenisProvider>
        <LuxuryCursorProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </LuxuryCursorProvider>
        </LenisProvider>
      </AuthProvider>
    </IntroProvider>
  );
}
