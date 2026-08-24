"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { consoleBase } from "@/lib/admin/paths";
import {
  fetchTryOnRequest,
  parseTryOnCustomization,
  updateTryOnRequest,
  type AdminTryOnRequest,
} from "@/lib/api/admin";

const STATUSES = [
  "new",
  "contacted",
  "customization_discussion",
  "confirmed",
  "order_created",
  "cancelled",
] as const;

export default function TryOnRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const base = consoleBase(pathname);
  const [row, setRow] = useState<AdminTryOnRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [suggestion, setSuggestion] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchTryOnRequest(params.id).then((data) => {
      setRow(data);
      setNotes(data.adminNotes ?? "");
      setCustomPrice(data.customPrice != null ? String(data.customPrice) : "");
    });
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!row) {
    return <p className="text-admin-muted">Loading request…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href={`${base}/try-on-requests`}
          className="text-[11px] uppercase tracking-widest text-admin-muted hover:text-admin-accent"
        >
          ← Try-on requests
        </Link>
        <h1 className="mt-2 font-display text-3xl text-admin-text">{row.name || "Guest look"}</h1>
        <p className="mt-1 text-sm text-admin-muted">
          {row.productName} · {row.createdAt.slice(0, 16).replace("T", " ")}
        </p>
      </div>

      {row.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.photoUrl}
          alt="Shared try-on"
          className="max-h-80 w-full border border-admin-border object-contain bg-admin-elevated"
        />
      )}

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-widest text-admin-muted">Email</dt>
          <dd>{row.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-admin-muted">Phone</dt>
          <dd>{row.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-admin-muted">Instagram</dt>
          <dd>{row.instagramHandle || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-admin-muted">Status</dt>
          <dd>
            <select
              value={row.status}
              onChange={(e) => {
                void updateTryOnRequest(row.id, { status: e.target.value }).then(setRow);
              }}
              className="mt-1 rounded border border-admin-border bg-admin-elevated px-2 py-1 font-mono text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-admin-muted">Message</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-admin-text">{row.message || "—"}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-admin-muted">
          AI customization suggestion
        </h2>
        <p className="text-xs text-admin-muted">
          Suggestion only — never auto-creates an order. Review and edit before acting.
        </p>
        <button
          type="button"
          onClick={() => {
            const raw =
              row.message ||
              (typeof row.customizationRequest?.raw === "string"
                ? row.customizationRequest.raw
                : "");
            if (!raw) {
              setMessage("No customer message to parse.");
              return;
            }
            void parseTryOnCustomization(row.id, raw).then((res) => {
              setSuggestion(res.suggestion);
              setMessage("Suggestion ready for review (not applied).");
            });
          }}
          className="rounded border border-admin-border px-3 py-2 text-xs uppercase tracking-widest text-admin-accent"
        >
          Parse customization
        </button>
        {suggestion && (
          <pre className="overflow-x-auto rounded border border-admin-border bg-admin-elevated p-3 text-xs">
            {JSON.stringify(suggestion, null, 2)}
          </pre>
        )}
      </section>

      <section className="space-y-3">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-admin-muted">Admin notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded border border-admin-border bg-admin-elevated px-3 py-2 text-sm"
            rows={3}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-admin-muted">
            Custom price (₹)
          </span>
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            className="mt-1 w-40 rounded border border-admin-border bg-admin-elevated px-3 py-2 font-mono text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            void updateTryOnRequest(row.id, {
              adminNotes: notes,
              customPrice: customPrice ? Number(customPrice) : null,
              customizationRequest: suggestion ?? row.customizationRequest,
            }).then((next) => {
              setRow(next);
              setMessage("Saved.");
            });
          }}
          className="rounded bg-admin-accent px-4 py-2 text-xs uppercase tracking-widest text-admin-bg"
        >
          Save notes
        </button>
        {message && <p className="text-sm text-admin-muted">{message}</p>}
      </section>
    </div>
  );
}
