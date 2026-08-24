"use client";

import { useEffect, useState } from "react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import {
  createAdminProduct,
  createAdminVariant,
  deleteAdminVariant,
  fetchCategories,
  analyzeProductImage,
  updateAdminProduct,
  updateAdminVariant,
  type AdminProduct,
} from "@/lib/api/admin";
import { formatPrice, EARRING_SIZES } from "@/lib/fixtures";

const MATERIALS = [
  "cotton",
  "silk-thread",
  "zari",
  "linen",
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
  tags: string;
  status: "draft" | "published" | "archived";
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
  tags: "",
  status: "draft",
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
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    category: string;
    material: string;
    tags: string[];
    estimatedPriceRange: string;
  } | null>(null);

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
        tags: (product.tags ?? []).join(", "),
        status: (product.status as ProductFormState["status"]) || "published",
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
      setVariants([{ sku: "", color: "", size: "Bigger", priceAmount: 160, stock: 10 }]);
    }
    setError(null);
  }, [open, product]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const variantPrices = variants
        .filter((v) => v.sku)
        .map((v) => Number(v.priceAmount))
        .filter((amount) => Number.isFinite(amount));
      const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : Number(form.minPrice);

      const body = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        categoryId: form.categoryId,
        primaryMaterial: form.primaryMaterial,
        minPrice,
        featured: form.featured,
        careInstructions: form.careInstructions || undefined,
        occasion: form.occasion ? form.occasion.split(",").map((s) => s.trim()) : [],
        images: form.images,
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        aiGeneratedTags: suggestion?.tags,
        status: form.status,
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
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: isEdit
                      ? f.slug
                      : name
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, ""),
                  }));
                }}
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
              onFileUploaded={setLastFile}
              className="mt-2"
            />
            <button
              type="button"
              disabled={!lastFile || aiBusy}
              onClick={() => {
                if (!lastFile) return;
                setAiBusy(true);
                setAiError(null);
                void analyzeProductImage(lastFile)
                  .then((result) => {
                    if (!result.ok || !result.suggestion) {
                      setAiError(result.error ?? "Could not analyze this photograph.");
                      setSuggestion(null);
                      return;
                    }
                    setSuggestion(result.suggestion);
                  })
                  .catch((err: Error) => setAiError(err.message))
                  .finally(() => setAiBusy(false));
              }}
              className="mt-3 rounded border border-admin-accent/40 px-3 py-2 text-[10px] uppercase tracking-widest text-admin-accent disabled:opacity-40"
            >
              {aiBusy ? "Reading the photograph…" : "Analyze with AI"}
            </button>
            {aiError && <p className="mt-2 text-xs text-admin-danger">{aiError}</p>}
            {suggestion && (
              <aside className="mt-3 space-y-2 rounded border border-dashed border-admin-accent/40 bg-admin-elevated p-3 text-sm">
                <p className="font-mono text-[10px] uppercase tracking-widest text-admin-muted">
                  Suggestions — apply only what you accept
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span>Category: {suggestion.category}</span>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-widest text-admin-accent"
                    onClick={() => {
                      const match = categories.find((c) =>
                        c.name.toLowerCase().includes(suggestion.category.toLowerCase().split(" ")[0] ?? ""),
                      );
                      if (match) setForm((f) => ({ ...f, categoryId: match.id }));
                    }}
                  >
                    Apply
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Material: {suggestion.material}</span>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-widest text-admin-accent"
                    onClick={() => setForm((f) => ({ ...f, primaryMaterial: suggestion.material }))}
                  >
                    Apply
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Tags: {suggestion.tags.join(", ")}</span>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-widest text-admin-accent"
                    onClick={() => setForm((f) => ({ ...f, tags: suggestion.tags.join(", ") }))}
                  >
                    Apply
                  </button>
                </div>
                <p className="font-mono text-xs text-admin-muted">
                  Price range: {suggestion.estimatedPriceRange}
                </p>
              </aside>
            )}
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Tags</span>
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="statement, festive, pearls"
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm text-admin-text"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-admin-muted">Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as ProductFormState["status"] }))
              }
              className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm"
            >
              <option value="draft">Save as draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div className="rounded border border-admin-border p-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-admin-muted">
              Variants — size &amp; price
            </p>
            <p className="mb-3 text-[11px] text-admin-muted">
              Bigger earrings are ₹160. Smaller earrings are ₹130. Price is in rupees.
            </p>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={v.id ?? i} className="grid gap-2 sm:grid-cols-6">
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
                  <select
                    value={v.size}
                    onChange={(e) => {
                      const next = [...variants];
                      const size = e.target.value;
                      const priceAmount =
                        size === "Bigger" ? 160 : size === "Smaller" ? 130 : v.priceAmount;
                      next[i] = { ...v, size, priceAmount };
                      setVariants(next);
                    }}
                    className="rounded border border-admin-border bg-admin-elevated px-2 py-1 text-xs text-admin-text"
                  >
                    <option value="">Size…</option>
                    {EARRING_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
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
                    placeholder="Price (₹)"
                    type="number"
                    min={0}
                    step={1}
                    value={v.priceAmount}
                    onChange={(e) => {
                      const next = [...variants];
                      next[i] = { ...v, priceAmount: Number(e.target.value) };
                      setVariants(next);
                    }}
                    className="rounded border border-admin-border bg-admin-elevated px-2 py-1 text-xs text-admin-text"
                    aria-label="Price in rupees"
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
                        onClick={() =>
                          void deleteAdminVariant(product!.id, v.id!).then(() =>
                            setVariants(variants.filter((_, j) => j !== i)),
                          )
                        }
                        className="text-[10px] uppercase tracking-widest text-admin-danger"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setVariants([
                  ...variants,
                  { sku: "", color: "", size: "Smaller", priceAmount: 130, stock: 10 },
                ])
              }
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
