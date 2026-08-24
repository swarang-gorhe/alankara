"use client";

import { useMemo, useState } from "react";
import { PearlRating, PearlRatingInput } from "@/components/reviews/PearlRating";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/api/commerce";
import type { ReviewFixture } from "@/lib/fixtures/types";

type ProductReviewsProps = {
  productId: string;
  reviews: ReviewFixture[];
  averageRating?: number | null;
  reviewCount?: number;
};

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  const { user } = useAuth();
  const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...reviews];
    if (sort === "highest") copy.sort((a, b) => b.rating - a.rating);
    else if (sort === "lowest") copy.sort((a, b) => a.rating - b.rating);
    else copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return copy;
  }, [reviews, sort]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      await submitReview({
        productId,
        rating,
        title: title || undefined,
        text: body,
        authorName: guestName || undefined,
        authorEmail: user ? undefined : guestEmail,
      });
      setStatus("Thank you. Your note is with the atelier for a quiet review before it appears.");
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <PearlRating rating={Math.round(averageRating ?? 0)} size="md" />
            <p className="font-display text-2xl text-maroon">
              {averageRating ? averageRating.toFixed(1) : "New"}
            </p>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {reviewCount ?? reviews.length} notes from wearers
          </p>
        </div>
        <label className="text-xs uppercase tracking-widest text-ink-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="ml-2 rounded-sm border border-sage/30 bg-ivory px-2 py-1 text-ink"
          >
            <option value="newest">Most recent</option>
            <option value="highest">Highest</option>
            <option value="lowest">Lowest</option>
          </select>
        </label>
      </div>

      {sorted.length === 0 ? (
        <p className="font-body text-ink-muted">
          No published notes yet — be the first to tell us how it sat through the day.
        </p>
      ) : (
        <ul className="space-y-5">
          {sorted.map((review) => (
            <li key={review.id} className="rounded-sm border border-sage/25 bg-ivory/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <PearlRating rating={review.rating} />
                {review.verifiedPurchase && (
                  <span className="text-[10px] uppercase tracking-widest text-olive">
                    Verified purchase
                  </span>
                )}
              </div>
              {review.title && (
                <p className="mt-2 font-display text-lg text-maroon">{review.title}</p>
              )}
              <p className="mt-2 font-body text-sm leading-relaxed text-ink">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-3 text-xs text-ink-muted">{review.authorName}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="rounded-sm border border-dashed border-champagne/40 bg-cotton/40 p-6"
      >
        <p className="font-display text-xl text-maroon">Leave a note</p>
        <p className="mt-1 text-sm text-ink-muted">
          We read every word before it appears — a small atelier, a considered ledger.
        </p>
        <div className="mt-4">
          <PearlRatingInput value={rating} onChange={setRating} />
        </div>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-4 w-full rounded-sm border border-sage/30 bg-ivory px-3 py-2 text-sm"
        />
        <textarea
          required
          minLength={10}
          rows={4}
          placeholder="How did it feel to wear?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-3 w-full rounded-sm border border-sage/30 bg-ivory px-3 py-2 text-sm"
        />
        {!user && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="rounded-sm border border-sage/30 bg-ivory px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email (kept private)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="rounded-sm border border-sage/30 bg-ivory px-3 py-2 text-sm"
            />
          </div>
        )}
        {status && <p className="mt-3 text-sm text-olive">{status}</p>}
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        <Button type="submit" disabled={submitting} className="mt-4">
          {submitting ? "Sending…" : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
