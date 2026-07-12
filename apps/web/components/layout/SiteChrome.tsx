"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminAiPanel } from "@/components/admin/AdminAiPanel";
import { FaqChatWidget } from "@/components/chat/FaqChatWidget";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        {children}
        <AdminAiPanel />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FaqChatWidget />
    </div>
  );
}
