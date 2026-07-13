"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  fetchAdminProducts,
  fetchDashboardStats,
  updateVariantStock,
  type AdminProduct,
} from "@/lib/api/admin";

export default function AdminInventoryPage() {
  const [alerts, setAlerts] = useState<
    Array<{ variantId: string; sku: string; productName: string; stock: number }>
  >([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});

  const load = () => {
    setLoading(true);
    Promise.all([fetchDashboardStats(), fetchAdminProducts()])
      .then(([stats, productData]) => {
        setAlerts(stats.lowStockAlerts);
        setProducts(productData.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const saveStock = async (productId: string, variantId: string) => {
    const stock = stockEdits[variantId];
    if (stock === undefined) return;
    await updateVariantStock(productId, variantId, stock);
    load();
  };

  if (loading) {
    return <p className="text-admin-muted">Loading inventory…</p>;
  }

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      ...v,
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-admin-text">Inventory</h1>
        <p className="mt-1 text-sm text-admin-muted">Edit stock inline — changes save immediately</p>
      </div>

      {alerts.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-admin-text">Low stock alerts</h2>
          <AdminTable columns={["Product", "SKU", "Stock"]} className="mt-4">
            {alerts.map((alert) => (
              <AdminTableRow key={alert.variantId}>
                <AdminTableCell>{alert.productName}</AdminTableCell>
                <AdminTableCell className="font-mono text-xs">{alert.sku}</AdminTableCell>
                <AdminTableCell className="text-admin-danger">{alert.stock}</AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl text-admin-text">All variants</h2>
        <AdminTable columns={["Product", "SKU", "Stock", ""]} className="mt-4">
          {allVariants.map((v) => (
            <AdminTableRow key={v.id}>
              <AdminTableCell>{v.productName}</AdminTableCell>
              <AdminTableCell className="font-mono text-xs text-admin-muted">{v.sku}</AdminTableCell>
              <AdminTableCell>
                <input
                  type="number"
                  min={0}
                  defaultValue={v.stock}
                  onChange={(e) =>
                    setStockEdits((s) => ({ ...s, [v.id]: Number(e.target.value) }))
                  }
                  className="w-20 rounded border border-admin-border bg-admin-elevated px-2 py-1 text-sm text-admin-text"
                />
              </AdminTableCell>
              <AdminTableCell>
                <button
                  type="button"
                  onClick={() => void saveStock(v.productId, v.id)}
                  className="text-xs uppercase tracking-widest text-admin-accent hover:underline"
                >
                  Save
                </button>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      </section>
    </div>
  );
}
