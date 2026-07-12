"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FaqChatWidget } from "@/components/chat/FaqChatWidget";
import { useIntro } from "@/contexts/IntroContext";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const { hideChrome } = useIntro();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        className={cn(
          "transition-opacity duration-slow ease-luxury",
          isHome && hideChrome && "pointer-events-none opacity-0",
        )}
      />
      <main className="flex-1">{children}</main>
      {!isHome && <Footer />}
      <FaqChatWidget />
    </div>
  );
}
