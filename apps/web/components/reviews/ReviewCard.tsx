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
            i < rating ? "fill-gold-bright text-gold-bright" : "text-gold/30",
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
        "relative rounded-sm border border-gold/25 bg-cream-light p-6 shadow-[0_2px_12px_rgba(44,36,32,0.04)]",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-gold-bright before:to-gold/40",
        featured && "md:col-span-2 md:p-8",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <StarRating rating={review.rating} />
          <p className="mt-2 font-display text-lg text-maroon">{review.authorName}</p>
          <p className="text-xs text-charcoal-muted">{date}</p>
        </div>
        <Link
          href={`/product/${review.productSlug}`}
          className="text-right text-xs uppercase tracking-widest text-gold transition-colors hover:text-gold-bright"
        >
          {review.productName}
        </Link>
      </div>

      <p
        className={cn(
          "font-body leading-relaxed text-charcoal",
          featured ? "text-lg md:text-xl" : "text-sm md:text-base",
        )}
      >
        &ldquo;{review.text}&rdquo;
      </p>

      <p className="mt-4 text-xs uppercase tracking-widest text-charcoal-muted">
        {review.categorySlug.replace("-", " ")}
      </p>
    </article>
  );
}
