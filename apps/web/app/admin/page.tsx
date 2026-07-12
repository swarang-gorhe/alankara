"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { fetchDashboardStats, type DashboardStats } from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-maroon">{error}</p>;
  }

  if (!stats) {
    return <p className="text-charcoal-muted">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-maroon">Dashboard</h1>
        <p className="mt-1 text-sm text-charcoal-muted">Revenue, orders, and inventory alerts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total revenue"
          value={formatPrice(stats.revenue.amount)}
          hint="All non-cancelled orders"
        />
        <StatCard label="Orders" value={stats.ordersCount} />
        <StatCard
          label="Pending payment"
          value={stats.pendingOrdersCount}
          hint="Awaiting payment gateway"
        />
      </div>

      <section>
        <h2 className="font-display text-xl text-maroon">Low stock alerts</h2>
        <p className="mt-1 text-sm text-charcoal-muted">Variants at 5 units or fewer</p>
        {stats.lowStockAlerts.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal-muted">All variants are well stocked.</p>
        ) : (
          <AdminTable columns={["Product", "SKU", "Stock"]} className="mt-4">
            {stats.lowStockAlerts.map((alert) => (
              <AdminTableRow key={alert.variantId}>
                <AdminTableCell>{alert.productName}</AdminTableCell>
                <AdminTableCell className="font-mono text-xs">{alert.sku}</AdminTableCell>
                <AdminTableCell>
                  <span className={alert.stock === 0 ? "text-maroon" : "text-gold"}>
                    {alert.stock}
                  </span>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        )}
      </section>
    </div>
  );
}
