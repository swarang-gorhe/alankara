"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { fetchAdminCustomers } from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<
    Array<{ email: string; orderCount: number; totalSpent: number; lastOrderAt: string | null }>
  >([]);

  useEffect(() => {
    fetchAdminCustomers().then(setCustomers);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-admin-text">Customers</h1>
      <p className="text-sm text-admin-muted">Distinct shoppers from order history</p>
      <AdminTable columns={["Email", "Orders", "Total spent", "Last order"]}>
        {customers.map((c) => (
          <AdminTableRow key={c.email}>
            <AdminTableCell>{c.email}</AdminTableCell>
            <AdminTableCell>{c.orderCount}</AdminTableCell>
            <AdminTableCell>{formatPrice(c.totalSpent)}</AdminTableCell>
            <AdminTableCell className="text-xs text-admin-muted">
              {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>
    </div>
  );
}
