"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  type AdminProduct,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

const CATEGORIES = [
  { id: "cat-cloth-earrings", label: "Cloth Earrings" },
  { id: "cat-fabric-necklaces", label: "Fabric Necklaces" },
  { id: "cat-fabric-bracelets", label: "Fabric Bracelets" },
  { id: "cat-fabric-rings", label: "Fabric Rings" },
  { id: "cat-hair-accessories", label: "Hair Accessories" },
  { id: "cat-jewellery-sets", label: "Jewellery Sets" },
  { id: "cat-embroidered-textile-jewellery", label: "Embroidered Textile" },
  { id: "cat-sustainable-fashion-accessories", label: "Sustainable Accessories" },
];

const MATERIALS = ["cotton", "silk-thread", "zari", "linen", "upcycled-fabric", "ikat", "mirror-work"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    categoryId: "cat-cloth-earrings",
    primaryMaterial: "cotton",
    minPrice: 0,
    featured: false,
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
      categoryId: "cat-cloth-earrings",
      primaryMaterial: "cotton",
      minPrice: 0,
      featured: false,
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteAdminProduct(id);
    load();
  };

  const startEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setShowForm(false);
    setForm({
      slug: product.slug,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      primaryMaterial: product.primaryMaterial,
      minPrice: product.minPrice,
      featured: product.featured,
    });
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    await updateAdminProduct(editingId, { ...form, minPrice: Number(form.minPrice) });
    setEditingId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-admin-text">Products</h1>
          <p className="mt-1 text-sm text-admin-muted">Cloth & fabric jewellery catalog</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg hover:bg-admin-accent-dim"
        >
          {showForm ? "Cancel" : "New product"}
        </button>
      </div>

      {editingId && (
        <form
          onSubmit={(e) => void handleUpdate(e)}
          className="grid gap-4 rounded-lg border border-admin-accent/40 bg-admin-surface p-5 sm:grid-cols-2"
        >
          <p className="sm:col-span-2 font-display text-lg text-admin-text">Edit product</p>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Min price (paise)</span>
            <input
              type="number"
              value={form.minPrice}
              onChange={(e) => setForm((f) => ({ ...f, minPrice: Number(e.target.value) }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Description</span>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
              rows={3}
            />
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg">
              Save changes
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="text-xs uppercase tracking-widest text-admin-muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showForm && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="grid gap-4 rounded-lg border border-admin-border bg-admin-surface p-5 sm:grid-cols-2"
        >
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Slug</span>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Category</span>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Material</span>
            <select
              value={form.primaryMaterial}
              onChange={(e) => setForm((f) => ({ ...f, primaryMaterial: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            >
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Min price (paise)</span>
            <input
              type="number"
              value={form.minPrice}
              onChange={(e) => setForm((f) => ({ ...f, minPrice: Number(e.target.value) }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>
          <label className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="rounded border-admin-border"
            />
            <span className="text-xs uppercase tracking-widest text-admin-muted">Featured</span>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Description</span>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
              rows={3}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg"
            >
              Create product
            </button>
          </div>
        </form>
      )}

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
                    onClick={() => startEdit(product)}
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
    </div>
  );
}
