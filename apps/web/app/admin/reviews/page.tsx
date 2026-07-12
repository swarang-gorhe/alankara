"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import {
  fetchAdminProducts,
  fetchAdminReviews,
  moderateReview,
  type AdminProduct,
  type AdminReview,
} from "@/lib/api/admin";
import { regenerateProductReviewSummary, summarizeProductReviews } from "@/lib/api/ai";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "hidden">("all");
  const [summaryProductId, setSummaryProductId] = useState("");
  const [summaryStatus, setSummaryStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    const approved = filter === "all" ? undefined : filter === "approved";
    fetchAdminReviews(approved).then((data) => setReviews(data.items));
  };

  useEffect(() => {
    load();
  }, [filter]);

  useEffect(() => {
    fetchAdminProducts().then((data) => setProducts(data.items));
  }, []);

  const toggleApproval = async (review: AdminReview) => {
    await moderateReview(review.id, !review.approved);
    load();
  };

  const runSummary = async (regenerate: boolean) => {
    if (!summaryProductId) return;
    setBusy(true);
    setSummaryStatus(null);
    try {
      if (regenerate) {
        const queued = await regenerateProductReviewSummary(summaryProductId);
        setSummaryStatus(queued.message);
      } else {
        const result = await summarizeProductReviews(summaryProductId);
        setSummaryStatus(result.summary);
      }
    } catch (err) {
      setSummaryStatus(err instanceof Error ? err.message : "Summary failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-maroon">Reviews</h1>
          <p className="mt-1 text-sm text-charcoal-muted">Moderation and AI summary regeneration</p>
        </div>
        <div className="flex gap-2">
          {(["all", "approved", "hidden"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-sm px-3 py-1.5 text-xs uppercase tracking-widest ${
                filter === value
                  ? "bg-maroon text-cream-light"
                  : "border border-gold/30 text-charcoal-muted hover:bg-cream"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-sm border border-gold/25 bg-cream-light p-4">
        <div>
          <label htmlFor="summary-product" className="text-[10px] uppercase tracking-widest text-gold">
            Product summary
          </label>
          <select
            id="summary-product"
            value={summaryProductId}
            onChange={(e) => setSummaryProductId(e.target.value)}
            className="mt-1 block rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          >
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={!summaryProductId || busy}
          onClick={() => void runSummary(false)}
          className="rounded-sm bg-maroon px-4 py-2 text-xs uppercase tracking-widest text-cream-light disabled:opacity-50"
        >
          Generate now
        </button>
        <button
          type="button"
          disabled={!summaryProductId || busy}
          onClick={() => void runSummary(true)}
          className="rounded-sm border border-gold/40 px-4 py-2 text-xs uppercase tracking-widest text-charcoal disabled:opacity-50"
        >
          Queue regenerate
        </button>
        {summaryStatus && (
          <p className="w-full text-xs text-charcoal-muted">{summaryStatus}</p>
        )}
      </div>

      <AdminTable columns={["Product", "Author", "Rating", "Excerpt", "Status", ""]}>
        {reviews.map((review) => (
          <AdminTableRow key={review.id}>
            <AdminTableCell className="text-sm">{review.productName}</AdminTableCell>
            <AdminTableCell>{review.authorName}</AdminTableCell>
            <AdminTableCell>{review.rating}★</AdminTableCell>
            <AdminTableCell className="max-w-xs truncate text-sm text-charcoal-muted">
              {review.text}
            </AdminTableCell>
            <AdminTableCell>
              <span className={review.approved ? "text-olive" : "text-maroon"}>
                {review.approved ? "Approved" : "Hidden"}
              </span>
            </AdminTableCell>
            <AdminTableCell>
              <button
                type="button"
                onClick={() => void toggleApproval(review)}
                className="text-xs uppercase tracking-widest text-gold hover:underline"
              >
                {review.approved ? "Hide" : "Approve"}
              </button>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>
    </div>
  );
}
