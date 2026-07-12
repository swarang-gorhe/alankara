"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin/AdminTable";
import { fetchAdminReviews, moderateReview, type AdminReview } from "@/lib/api/admin";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "hidden">("all");

  const load = () => {
    const approved =
      filter === "all" ? undefined : filter === "approved";
    fetchAdminReviews(approved).then((data) => setReviews(data.items));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const toggleApproval = async (review: AdminReview) => {
    await moderateReview(review.id, !review.approved);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-maroon">Reviews</h1>
          <p className="mt-1 text-sm text-charcoal-muted">
            Moderation — AI summary regen arrives in Phase 7
          </p>
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
