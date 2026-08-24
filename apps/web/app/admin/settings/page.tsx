"use client";

import { useEffect, useState } from "react";
import { fetchStoreSettings, updateStoreSettings, type StoreSettings } from "@/lib/api/admin";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreSettings().then(setSettings).catch(() => setSettings({
      lowStockThreshold: 5,
      currency: "INR",
      taxRateBps: 0,
    }));
  }, []);

  if (!settings) {
    return <p className="text-admin-muted">Loading settings…</p>;
  }

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const next = await updateStoreSettings(settings);
      setSettings(next);
      setMessage("Ledger settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-admin-text">Settings</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Thresholds and currency for the atelier ledger. Staff accounts use the same console.
        </p>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-widest text-admin-muted">Low-stock threshold</span>
        <input
          type="number"
          min={0}
          value={settings.lowStockThreshold}
          onChange={(e) =>
            setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })
          }
          className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 font-mono text-sm"
        />
      </label>

      <label className="block">
        <span className="text-xs uppercase tracking-widest text-admin-muted">Store currency</span>
        <input
          value={settings.currency}
          onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
          className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 font-mono text-sm"
        />
      </label>

      <label className="block">
        <span className="text-xs uppercase tracking-widest text-admin-muted">Tax rate (basis points)</span>
        <input
          type="number"
          min={0}
          value={settings.taxRateBps}
          onChange={(e) => setSettings({ ...settings, taxRateBps: Number(e.target.value) })}
          className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-admin-muted">100 bps = 1%. Leave at 0 if tax is included.</p>
      </label>

      <div className="rounded border border-admin-border bg-admin-surface p-4 text-sm text-admin-muted">
        <p className="font-display text-admin-text">Staff access</p>
        <p className="mt-2">
          Local owner: <span className="font-mono">admin@alankara.local</span>
        </p>
        <p>
          Local staff: <span className="font-mono">staff@alankara.local</span>
        </p>
        <p className="mt-2">Production uses Supabase roles <span className="font-mono">owner</span> and <span className="font-mono">staff</span>.</p>
      </div>

      {message && <p className="text-sm text-olive">{message}</p>}
      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-ivory disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
