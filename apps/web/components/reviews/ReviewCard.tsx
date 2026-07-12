import { Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReviewFixture } from "@/lib/fixtures/types";

type ReviewCardProps = {
  review: ReviewFixture;
  className?: string;
  featured?: boolean;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-champagne text-champagne" : "text-champagne/30",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review, className, featured = false }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      className={cn(
        "relative rounded-sm border border-sage/25 bg-ivory p-6 shadow-luxury",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-champagne before:to-champagne/40",
        featured && "md:col-span-2 md:p-8",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <StarRating rating={review.rating} />
          <p className="mt-2 font-display text-lg text-maroon">{review.authorName}</p>
          <p className="text-xs text-ink-muted">{date}</p>
        </div>
        <Link
          href={`/product/${review.productSlug}`}
          className="text-right text-xs uppercase tracking-widest text-champagne transition-colors hover:text-warm-brown"
        >
          {review.productName}
        </Link>
      </div>

      <p
        className={cn(
          "font-body leading-relaxed text-ink",
          featured ? "text-lg md:text-xl" : "text-sm md:text-base",
        )}
      >
        &ldquo;{review.text}&rdquo;
      </p>

      <p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">
        {review.categorySlug.replace("-", " ")}
      </p>
    </article>
  );
}
