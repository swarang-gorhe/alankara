"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  type AdminProduct,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    categoryId: "cat-necklaces",
    primaryMaterial: "gold",
    minPrice: 0,
  });

  const load = () => {
    setLoading(true);
    fetchAdminProducts()
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await createAdminProduct({ ...form, minPrice: Number(form.minPrice) });
    setShowForm(false);
    setForm({
      slug: "",
      name: "",
      description: "",
      categoryId: "cat-necklaces",
      primaryMaterial: "gold",
      minPrice: 0,
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteAdminProduct(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-maroon">Products</h1>
          <p className="mt-1 text-sm text-charcoal-muted">Catalog, variants, and inventory</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New product"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="grid gap-4 rounded-sm border border-gold/25 bg-cream-light p-5 sm:grid-cols-2"
        >
          {(
            [
              ["slug", "Slug"],
              ["name", "Name"],
              ["categoryId", "Category ID"],
              ["primaryMaterial", "Material"],
              ["minPrice", "Min price (paise)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs uppercase tracking-widest text-charcoal-muted">{label}</span>
              <input
                required={key !== "minPrice"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              />
            </label>
          ))}
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">Description</span>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit">Create product</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-charcoal-muted">Loading products…</p>
      ) : (
        <AdminTable columns={["Name", "Slug", "Variants", "From", "Stock", ""]}>
          {products.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            return (
              <AdminTableRow key={product.id}>
                <AdminTableCell className="font-medium">{product.name}</AdminTableCell>
                <AdminTableCell className="font-mono text-xs text-charcoal-muted">
                  {product.slug}
                </AdminTableCell>
                <AdminTableCell>{product.variants.length}</AdminTableCell>
                <AdminTableCell>{formatPrice(product.minPrice)}</AdminTableCell>
                <AdminTableCell>{totalStock}</AdminTableCell>
                <AdminTableCell>
                  <button
                    type="button"
                    onClick={() => void handleDelete(product.id)}
                    className="text-xs uppercase tracking-widest text-maroon hover:underline"
                  >
                    Delete
                  </button>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTable>
      )}
    </div>
  );
}
