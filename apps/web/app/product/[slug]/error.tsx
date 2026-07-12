"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type ProductErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ error, reset }: ProductErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-maroon">This piece eludes us</h1>
      <p className="mt-4 text-sm text-charcoal-muted">
        We could not load this product. It may have moved or the connection faltered.
      </p>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-2 text-xs text-charcoal-muted/70">{error.message}</p>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    </div>
  );
}
