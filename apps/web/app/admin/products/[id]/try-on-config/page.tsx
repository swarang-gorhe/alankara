"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { TryOnAssetUpload } from "@/components/admin/try-on/TryOnAssetUpload";
import { TryOnStaticPreview } from "@/components/admin/try-on/TryOnStaticPreview";
import { consoleBase } from "@/lib/admin/paths";
import {
  fetchTryOnConfig,
  updateTryOnConfig,
  type TryOnConfig,
} from "@/lib/api/admin";

const DEFAULTS: Omit<TryOnConfig, "productId" | "productName"> = {
  tryOnEnabled: false,
  tryOnType: "earring",
  tryOnAssetUrl: null,
  tryOnScale: 1,
  tryOnLeftOffsetX: 0,
  tryOnLeftOffsetY: 0,
  tryOnRightOffsetX: 0,
  tryOnRightOffsetY: 0,
  tryOnRotation: 0,
  tryOnVerticalOffset: 0,
  tryOnNecklaceAssetUrl: null,
  tryOnNecklaceLengthOffset: 0,
  tryOnNecklaceScale: 1,
  tryOnNecklaceRotationOffset: 0,
};

type NumberField = {
  key: keyof typeof DEFAULTS;
  label: string;
  min: number;
  max: number;
  step: number;
};

const EARRING_FIELDS: NumberField[] = [
  { key: "tryOnScale", label: "Scale", min: 0.2, max: 3, step: 0.05 },
  { key: "tryOnLeftOffsetX", label: "Left offset X", min: -40, max: 40, step: 0.5 },
  { key: "tryOnLeftOffsetY", label: "Left offset Y", min: -40, max: 40, step: 0.5 },
  { key: "tryOnRightOffsetX", label: "Right offset X", min: -40, max: 40, step: 0.5 },
  { key: "tryOnRightOffsetY", label: "Right offset Y", min: -40, max: 40, step: 0.5 },
  { key: "tryOnRotation", label: "Rotation (°)", min: -45, max: 45, step: 0.5 },
  { key: "tryOnVerticalOffset", label: "Vertical offset", min: -40, max: 40, step: 0.5 },
];

const NECKLACE_FIELDS: NumberField[] = [
  { key: "tryOnNecklaceScale", label: "Necklace scale", min: 0.2, max: 3, step: 0.05 },
  {
    key: "tryOnNecklaceLengthOffset",
    label: "Length offset (chain drop)",
    min: -30,
    max: 40,
    step: 0.5,
  },
  {
    key: "tryOnNecklaceRotationOffset",
    label: "Rotation offset (°)",
    min: -30,
    max: 30,
    step: 0.5,
  },
];

export default function TryOnConfigPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const base = consoleBase(pathname);
  const productId = params.id;

  const [config, setConfig] = useState<TryOnConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchTryOnConfig(productId)
      .then(setConfig)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load try-on config");
        setConfig(null);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const setNumber = (key: NumberField["key"], value: number) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const next = await updateTryOnConfig(productId, config);
      setConfig(next);
      setMessage("Try-on calibration saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            ...DEFAULTS,
            tryOnType: prev.tryOnType,
            tryOnAssetUrl: prev.tryOnAssetUrl,
            tryOnNecklaceAssetUrl: prev.tryOnNecklaceAssetUrl,
            tryOnEnabled: prev.tryOnEnabled,
          }
        : prev,
    );
  };

  if (loading) {
    return <p className="text-admin-muted">Loading try-on config…</p>;
  }

  if (!config) {
    return (
      <div className="space-y-4">
        <p className="text-admin-danger">{error ?? "Product not found."}</p>
        <Link href={`${base}/products`} className="text-xs uppercase tracking-widest text-admin-accent">
          ← Back to products
        </Link>
      </div>
    );
  }

  const isNecklace = config.tryOnType === "necklace";
  const fields = isNecklace ? NECKLACE_FIELDS : EARRING_FIELDS;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`${base}/products`}
            className="text-[11px] uppercase tracking-widest text-admin-muted hover:text-admin-accent"
          >
            ← Products
          </Link>
          <h1 className="mt-2 font-display text-3xl text-admin-text">Try-on config</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Calibrate <span className="text-admin-text">{config.productName}</span>
            {isNecklace
              ? " so the necklace hangs from the neck-base. Length offset varies by chain."
              : " so the earring sits on the ear guides. Offsets are percent of the preview face."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded border border-admin-border bg-admin-elevated px-3 py-2">
            <span className="text-[10px] uppercase tracking-widest text-admin-muted">Type</span>
            <select
              value={config.tryOnType}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tryOnType: e.target.value as "earring" | "necklace",
                })
              }
              className="bg-transparent text-xs text-admin-text outline-none"
            >
              <option value="earring">Earring</option>
              <option value="necklace">Necklace</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded border border-admin-border bg-admin-elevated px-4 py-3">
            <input
              type="checkbox"
              checked={config.tryOnEnabled}
              onChange={(e) => setConfig({ ...config, tryOnEnabled: e.target.checked })}
            />
            <span className="text-xs uppercase tracking-widest text-admin-muted">
              Enable Try It On
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-admin-muted">
              {isNecklace ? "Necklace try-on asset" : "Earring try-on asset"}
            </h2>
            {isNecklace ? (
              <TryOnAssetUpload
                url={config.tryOnNecklaceAssetUrl}
                onChange={(url) => setConfig({ ...config, tryOnNecklaceAssetUrl: url })}
              />
            ) : (
              <TryOnAssetUpload
                url={config.tryOnAssetUrl}
                onChange={(url) => setConfig({ ...config, tryOnAssetUrl: url })}
              />
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-widest text-admin-muted">Placement</h2>
              <button
                type="button"
                onClick={resetDefaults}
                className="text-[10px] uppercase tracking-widest text-admin-muted hover:text-admin-accent"
              >
                Reset offsets
              </button>
            </div>
            <div className="space-y-4">
              {fields.map((field) => {
                const value = Number(config[field.key] ?? 0);
                return (
                  <label key={field.key} className="block">
                    <div className="mb-1 flex justify-between text-[11px] uppercase tracking-widest text-admin-muted">
                      <span>{field.label}</span>
                      <span className="font-mono text-admin-text">{value}</span>
                    </div>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={value}
                      onChange={(e) => setNumber(field.key, Number(e.target.value))}
                      className="w-full accent-admin-accent"
                    />
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={value}
                      onChange={(e) => setNumber(field.key, Number(e.target.value))}
                      className="mt-1 w-28 rounded border border-admin-border bg-admin-elevated px-2 py-1 font-mono text-xs text-admin-text"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save calibration"}
            </button>
            {message && <p className="text-sm text-admin-muted">{message}</p>}
            {error && <p className="text-sm text-admin-danger">{error}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-admin-muted">Live preview</h2>
          <TryOnStaticPreview values={config} />
          <p className="text-[11px] text-admin-muted">
            {isNecklace
              ? "Champagne ring marks the neck-base. Length offset drops the clasp for chokers vs long chains."
              : "Gold dashed ovals mark approximate ear anchors. Fine-tune per product."}
          </p>
        </div>
      </div>
    </div>
  );
}
