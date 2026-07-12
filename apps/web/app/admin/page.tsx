"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { fetchDashboardStats, type DashboardStats } from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

function RevenueChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  if (data.length === 0) {
    return <p className="text-sm text-admin-muted">No revenue data yet.</p>;
  }
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-3 h-32">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t bg-admin-accent/70 transition-all"
            style={{ height: `${(d.amount / max) * 100}%`, minHeight: d.amount > 0 ? "4px" : "0" }}
            title={formatPrice(d.amount)}
          />
          <span className="text-[10px] text-admin-muted">{d.month.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-admin-danger">{error}</p>;
  }

  if (!stats) {
    return <p className="text-admin-muted">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-admin-text">Dashboard</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Revenue, orders, inventory, and recent activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPrice(stats.revenue.amount)}
          hint="All non-cancelled orders"
        />
        <StatCard label="Orders" value={stats.ordersCount} hint={`${stats.pendingOrdersCount} pending`} />
        <StatCard label="Products" value={stats.productsCount} />
        <StatCard label="Customers" value={stats.customersCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Reviews" value={stats.reviewsCount} hint={`${stats.pendingReviewsCount} pending`} />
        <StatCard label="Active coupons" value={stats.activeCouponsCount} />
        <StatCard label="Low stock SKUs" value={stats.lowStockAlerts.length} trend={stats.lowStockAlerts.length > 0 ? "down" : "neutral"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-admin-border bg-admin-surface p-6">
          <h2 className="font-display text-lg text-admin-text">Revenue trend</h2>
          <p className="mt-1 text-xs text-admin-muted">Monthly revenue (INR)</p>
          <div className="mt-6">
            <RevenueChart data={stats.revenueByMonth ?? []} />
          </div>
        </section>

        <section className="rounded-lg border border-admin-border bg-admin-surface p-6">
          <h2 className="font-display text-lg text-admin-text">Recent activity</h2>
          <p className="mt-1 text-xs text-admin-muted">Latest orders</p>
          {(stats.recentActivity ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-admin-muted">No recent orders.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {(stats.recentActivity ?? []).map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-admin-text">{item.label}</span>
                  <span className="text-admin-muted">{formatPrice(item.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <h2 className="font-display text-xl text-admin-text">Low stock alerts</h2>
        <p className="mt-1 text-sm text-admin-muted">Variants at 5 units or fewer</p>
        {stats.lowStockAlerts.length === 0 ? (
          <p className="mt-4 text-sm text-admin-muted">All variants are well stocked.</p>
        ) : (
          <AdminTable columns={["Product", "SKU", "Stock"]} className="mt-4">
            {stats.lowStockAlerts.map((alert) => (
              <AdminTableRow key={alert.variantId}>
                <AdminTableCell>{alert.productName}</AdminTableCell>
                <AdminTableCell className="font-mono text-xs text-admin-muted">{alert.sku}</AdminTableCell>
                <AdminTableCell>
                  <span className={alert.stock === 0 ? "text-admin-danger" : "text-admin-accent"}>
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
