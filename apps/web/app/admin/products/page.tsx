"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminProductModal } from "@/components/admin/AdminProductModal";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  deleteAdminProduct,
  fetchAdminProduct,
  fetchAdminProducts,
  type AdminProduct,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminProducts(1, search || undefined)
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = async (product: AdminProduct) => {
    const full = await fetchAdminProduct(product.id);
    setEditingProduct(full);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteAdminProduct(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-admin-text">Products</h1>
          <p className="mt-1 text-sm text-admin-muted">Add and manage your catalog — changes appear on the shop instantly</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg hover:bg-admin-accent-dim"
        >
          New product
        </button>
      </div>

      <input
        type="search"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
      />

      {loading ? (
        <p className="text-admin-muted">Loading products…</p>
      ) : (
        <AdminTable columns={["Name", "Slug", "Category", "Variants", "From", "Stock", ""]}>
          {products.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            return (
              <AdminTableRow key={product.id}>
                <AdminTableCell className="font-medium">
                  {product.name}
                  {product.featured && (
                    <span className="ml-2 text-[10px] uppercase text-admin-accent">Featured</span>
                  )}
                </AdminTableCell>
                <AdminTableCell className="font-mono text-xs text-admin-muted">{product.slug}</AdminTableCell>
                <AdminTableCell className="text-xs text-admin-muted">{product.categorySlug}</AdminTableCell>
                <AdminTableCell>{product.variants.length}</AdminTableCell>
                <AdminTableCell>{formatPrice(product.minPrice)}</AdminTableCell>
                <AdminTableCell>
                  <span className={totalStock <= 5 ? "text-admin-danger" : ""}>{totalStock}</span>
                </AdminTableCell>
                <AdminTableCell className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void openEdit(product)}
                    className="text-xs uppercase tracking-widest text-admin-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(product.id)}
                    className="text-xs uppercase tracking-widest text-admin-danger hover:underline"
                  >
                    Delete
                  </button>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTable>
      )}

      <AdminProductModal
        open={modalOpen}
        product={editingProduct}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={load}
      />
    </div>
  );
}
