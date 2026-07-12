"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { fetchDashboardStats, fetchAdminProducts, type AdminProduct } from "@/lib/api/admin";

export default function AdminInventoryPage() {
  const [alerts, setAlerts] = useState<Array<{
    variantId: string;
    sku: string;
    productName: string;
    stock: number;
  }>>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchAdminProducts()])
      .then(([stats, productData]) => {
        setAlerts(stats.lowStockAlerts);
        setProducts(productData.items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-admin-muted">Loading inventory…</p>;
  }

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({
      productName: p.name,
      productSlug: p.slug,
      ...v,
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-admin-text">Inventory</h1>
        <p className="mt-1 text-sm text-admin-muted">Stock levels and low-stock alerts</p>
      </div>

      <section>
        <h2 className="font-display text-xl text-admin-text">Low stock alerts</h2>
        <p className="mt-1 text-sm text-admin-muted">{alerts.length} variants need attention</p>
        {alerts.length === 0 ? (
          <p className="mt-4 text-sm text-admin-muted">All variants are well stocked.</p>
        ) : (
          <AdminTable columns={["Product", "SKU", "Stock", "Status"]} className="mt-4">
            {alerts.map((alert) => (
              <AdminTableRow key={alert.variantId}>
                <AdminTableCell>{alert.productName}</AdminTableCell>
                <AdminTableCell className="font-mono text-xs text-admin-muted">{alert.sku}</AdminTableCell>
                <AdminTableCell>
                  <span className={alert.stock === 0 ? "text-admin-danger" : "text-admin-accent"}>
                    {alert.stock}
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-xs uppercase tracking-widest text-admin-danger">
                    {alert.stock === 0 ? "Out of stock" : "Low stock"}
                  </span>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl text-admin-text">All variants</h2>
        <AdminTable columns={["Product", "SKU", "Size/Color", "Stock", "Price"]} className="mt-4">
          {allVariants.map((v) => (
            <AdminTableRow key={v.id}>
              <AdminTableCell>{v.productName}</AdminTableCell>
              <AdminTableCell className="font-mono text-xs text-admin-muted">{v.sku}</AdminTableCell>
              <AdminTableCell className="text-xs text-admin-muted">
                {[v.size, v.color].filter(Boolean).join(" · ") || "—"}
              </AdminTableCell>
              <AdminTableCell>
                <span className={v.stock <= 5 ? "text-admin-danger" : ""}>{v.stock}</span>
              </AdminTableCell>
              <AdminTableCell>₹{(v.price.amount / 100).toFixed(0)}</AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      </section>
    </div>
  );
}
