import type { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";

export const metadata = {
  title: "Atelier Console — Alankara",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
