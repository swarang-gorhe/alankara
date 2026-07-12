export function ShopEmptyState() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <svg
        viewBox="0 0 200 160"
        className="mx-auto h-40 w-48 text-champagne/60"
        aria-hidden="true"
      >
        <ellipse cx="100" cy="120" rx="70" ry="12" fill="currentColor" opacity="0.2" />
        <path
          d="M60 90 Q100 40 140 90 L130 110 Q100 95 70 110 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle cx="85" cy="75" r="4" fill="currentColor" opacity="0.5" />
        <circle cx="115" cy="70" r="3" fill="currentColor" opacity="0.4" />
        <path
          d="M95 55 L100 30 L105 55"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
      <h2 className="mt-6 font-display text-2xl text-maroon">No threads match</h2>
      <p className="mt-3 font-body text-sm text-ink-muted">
        Try adjusting your filters — our full catalogue of fabric and thread pieces awaits.
      </p>
    </div>
  );
}
