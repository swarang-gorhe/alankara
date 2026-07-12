"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FaqChatWidget } from "@/components/chat/FaqChatWidget";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!isHome && <Footer />}
      <FaqChatWidget />
    </div>
  );
}
