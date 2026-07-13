"use client";

import { useEffect, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import {
  createAdminProduct,
  createAdminVariant,
  deleteAdminVariant,
  fetchCategories,
  updateAdminProduct,
  updateAdminVariant,
  type AdminProduct,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/fixtures";

const MATERIALS = [
  "cotton",
  "silk-thread",
  "zari",
  "linen",
  "embroidery",
  "pearls",
  "upcycled-fabric",
];

export type ProductFormState = {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  primaryMaterial: string;
  minPrice: number;
  featured: boolean;
  careInstructions: string;
  occasion: string;
  images: string[];
};

const emptyForm = (): ProductFormState => ({
  slug: "",
  name: "",
  description: "",
  shortDescription: "",
  categoryId: "",
  primaryMaterial: "cotton",
  minPrice: 0,
  featured: false,
  careInstructions: "",
  occasion: "",
  images: [],
});

type VariantDraft = {
  id?: string;
  sku: string;
  color: string;
  size: string;
  priceAmount: number;
  stock: number;
};

type AdminProductModalProps = {
  open: boolean;
  product: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
};

export function AdminProductModal({ open, product, onClose, onSaved }: AdminProductModalProps) {
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(product);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        slug: product.slug,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription ?? "",
        categoryId: product.categoryId,
        primaryMaterial: product.primaryMaterial,
        minPrice: product.minPrice,
        featured: product.featured,
        careInstructions: "",
        occasion: "",
        images: product.images ?? [],
      });
      setVariants(
        product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          color: v.color ?? "",
          size: v.size ?? "",
          priceAmount: v.price.amount,
          stock: v.stock,
        })),
      );
    } else {
      setForm(emptyForm());
      setVariants([{ sku: "", color: "", size: "", priceAmount: 0, stock: 10 }]);
    }
    setError(null);
  }, [open, product]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        categoryId: form.categoryId,
        primaryMaterial: form.primaryMaterial,
        minPrice: Number(form.minPrice),
        featured: form.featured,
        careInstructions: form.careInstructions || undefined,
        occasion: form.occasion ? form.occasion.split(",").map((s) => s.trim()) : [],
        images: form.images,
      };

      let productId = product?.id;
      if (isEdit && productId) {
        await updateAdminProduct(productId, body);
      } else {
        const created = await createAdminProduct(body);
        productId = created.id;
      }

      if (productId) {
        for (const v of variants) {
          if (!v.sku) continue;
          if (v.id) {
            await updateAdminVariant(productId, v.id, {
              sku: v.sku,
              color: v.color || undefined,
              size: v.size || undefined,
              priceAmount: Number(v.priceAmount),
              stock: Number(v.stock),
            });
          } else {
            await createAdminVariant(productId, {
              sku: v.sku,
              color: v.color || undefined,
              size: v.size || undefined,
              priceAmount: Number(v.priceAmount),
              stock: Number(v.stock),
            });
          }
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16">
      <div className="w-full max-w-2xl rounded-lg border border-admin-border bg-admin-surface p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-admin-text">
            {isEdit ? "Edit product" : "New product"}
          </h2>
          <button type="button" onClick={onClose} className="text-admin-muted hover:text-admin-text">
            ✕
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              <span className="text-xs uppercase tracking-widest text-admin-muted">Slug</span>
              <input
                required
                disabled={isEdit}
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-admin-muted">Category</span>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
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
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Short description</span>
            <input
              value={form.shortDescription}
              onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>

          <div>
            <span className="text-xs uppercase tracking-widest text-admin-muted">Images</span>
            <AdminImageUpload
              images={form.images}
              onChange={(images) => setForm((f) => ({ ...f, images }))}
              className="mt-2"
            />
          </div>

          <div className="rounded border border-admin-border p-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-admin-muted">Variants</p>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={v.id ?? i} className="grid gap-2 sm:grid-cols-5">
                  <input
                    placeholder="SKU"
                    required
                    value={v.sku}
                    onChange={(e) => {
                      const next = [...variants];
                      next[i] = { ...v, sku: e.target.value };
                      setVariants(next);
                    }}
                    className="rounded border border-admin-border bg-admin-elevated px-2 py-1 text-xs text-admin-text"
                  />
                  <input
                    placeholder="Color"
                    value={v.color}
                    onChange={(e) => {
                      const next = [...variants];
                      next[i] = { ...v, color: e.target.value };
                      setVariants(next);
                    }}
                    className="rounded border border-admin-border bg-admin-elevated px-2 py-1 text-xs text-admin-text"
                  />
                  <input
                    placeholder="Price (paise)"
                    type="number"
                    value={v.priceAmount}
                    onChange={(e) => {
                      const next = [...variants];
                      next[i] = { ...v, priceAmount: Number(e.target.value) };
                      setVariants(next);
                    }}
                    className="rounded border border-admin-border bg-admin-elevated px-2 py-1 text-xs text-admin-text"
                  />
                  <input
                    placeholder="Stock"
                    type="number"
                    value={v.stock}
                    onChange={(e) => {
                      const next = [...variants];
                      next[i] = { ...v, stock: Number(e.target.value) };
                      setVariants(next);
                    }}
                    className="rounded border border-admin-border bg-admin-elevated px-2 py-1 text-xs text-admin-text"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-admin-muted">{formatPrice(v.priceAmount)}</span>
                    {v.id && (
                      <button
                        type="button"
                        onClick={() => void deleteAdminVariant(product!.id, v.id!).then(() => setVariants(variants.filter((_, j) => j !== i)))}
                        className="text-[10px] text-admin-danger"
                      >
                        Del
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setVariants([...variants, { sku: "", color: "", size: "", priceAmount: 0, stock: 10 }])}
              className="mt-2 text-xs uppercase tracking-widest text-admin-accent"
            >
              + Add variant
            </button>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            <span className="text-xs uppercase tracking-widest text-admin-muted">Featured on homepage</span>
          </label>

          {error && <p className="text-sm text-admin-danger">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save product"}
            </button>
            <button type="button" onClick={onClose} className="text-xs uppercase tracking-widest text-admin-muted">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
