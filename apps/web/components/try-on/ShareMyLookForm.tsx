"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api/client";
import { getTryOnSessionId, trackTryOnEvent } from "./tryOnAnalytics";
import type { TryOnProduct } from "./types";

type ShareMyLookFormProps = {
  product: TryOnProduct;
  photoDataUrl: string | null;
  onClose: () => void;
  onSubmitted?: () => void;
};

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function ShareMyLookForm({ product, photoDataUrl, onClose, onSubmitted }: ShareMyLookFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [message, setMessage] = useState("");
  const [customization, setCustomization] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!consent) {
      setError("Please confirm you’re happy to share this look with Alankara.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | null = null;
      if (photoDataUrl && API_URL) {
        const blob = await dataUrlToBlob(photoDataUrl);
        const form = new FormData();
        form.append("file", blob, "try-on-look.jpg");
        form.append("productId", product.id);
        form.append("sessionId", getTryOnSessionId());
        const up = await fetch(`${API_URL}/try-on/upload`, { method: "POST", body: form });
        if (up.ok) {
          const data = (await up.json()) as { url: string };
          photoUrl = data.url;
        }
      }

      if (API_URL) {
        const res = await fetch(`${API_URL}/try-on/requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            productId: product.id,
            photoUrl,
            name,
            phone,
            email,
            instagramHandle: instagram,
            message,
            customizationRequest: customization
              ? { raw: customization, status: "pending_review" }
              : null,
            sessionId: getTryOnSessionId(),
          }),
        });
        if (!res.ok) throw new Error("Could not share just now");
      }

      void trackTryOnEvent("share", product.id);
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4 p-4 text-center">
        <h3 className="font-display text-2xl text-maroon">Thank you</h3>
        <p className="font-body text-sm text-ink-muted">
          We’ve received your look. The atelier will write back soon.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="bg-maroon px-4 py-2 font-body text-xs uppercase tracking-widest text-ivory"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
      <h3 className="font-display text-xl text-maroon">Share My Look</h3>
      <p className="font-body text-xs text-ink-muted">
        This uploads one selected frame to Alankara — only when you submit this form.
      </p>
      {(
        [
          ["Name", name, setName],
          ["Phone", phone, setPhone],
          ["Email", email, setEmail],
          ["Instagram", instagram, setInstagram],
        ] as const
      ).map(([label, value, setter]) => (
        <label key={label} className="block">
          <span className="font-body text-[10px] uppercase tracking-widest text-olive">{label}</span>
          <input
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="mt-1 w-full border border-champagne/40 bg-ivory px-3 py-2 font-body text-sm"
          />
        </label>
      ))}
      <label className="block">
        <span className="font-body text-[10px] uppercase tracking-widest text-olive">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full border border-champagne/40 bg-ivory px-3 py-2 font-body text-sm"
          rows={2}
        />
      </label>
      <label className="block">
        <span className="font-body text-[10px] uppercase tracking-widest text-olive">
          Customization wish
        </span>
        <textarea
          value={customization}
          onChange={(e) => setCustomization(e.target.value)}
          placeholder="e.g. Same shape in blush pink with pearl tips"
          className="mt-1 w-full border border-champagne/40 bg-ivory px-3 py-2 font-body text-sm"
          rows={2}
        />
      </label>
      <label className="flex items-start gap-2 font-body text-xs text-ink">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        I consent to share this photo and details with Alankara for styling / order follow-up.
      </label>
      {error && <p className="font-body text-xs text-error">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={saving}
          onClick={() => void submit()}
          className="bg-maroon px-4 py-2 font-body text-xs uppercase tracking-widest text-ivory disabled:opacity-50"
        >
          {saving ? "Sharing…" : "Share with Alankara"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 font-body text-xs uppercase tracking-widest text-olive"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
