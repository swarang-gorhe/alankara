"use client";

import { cn } from "@/lib/utils";

type PearlScatterProps = {
  density?: "light" | "medium" | "rich";
  corners?: "all" | "top" | "bottom";
  className?: string;
};

type PearlSpec = { x: string; y: string; s: number; o?: number };

const PEARL_SETS: Record<"light" | "medium" | "rich", PearlSpec[]> = {
  light: [
    { x: "4%", y: "8%", s: 10 },
    { x: "92%", y: "12%", s: 8 },
    { x: "8%", y: "88%", s: 12 },
    { x: "88%", y: "82%", s: 9 },
    { x: "15%", y: "22%", s: 6 },
    { x: "78%", y: "28%", s: 7 },
    { x: "22%", y: "72%", s: 5 },
    { x: "85%", y: "65%", s: 8 },
  ],
  medium: [
    { x: "3%", y: "6%", s: 12 },
    { x: "94%", y: "10%", s: 10 },
    { x: "6%", y: "90%", s: 14 },
    { x: "90%", y: "85%", s: 11 },
    { x: "12%", y: "18%", s: 7 },
    { x: "82%", y: "22%", s: 8 },
    { x: "18%", y: "68%", s: 6 },
    { x: "80%", y: "62%", s: 9 },
    { x: "5%", y: "42%", s: 5 },
    { x: "95%", y: "48%", s: 6 },
    { x: "28%", y: "5%", s: 8 },
    { x: "72%", y: "92%", s: 7 },
    { x: "38%", y: "94%", s: 5 },
    { x: "62%", y: "4%", s: 6 },
  ],
  rich: [
    { x: "2%", y: "4%", s: 14 },
    { x: "96%", y: "8%", s: 12 },
    { x: "4%", y: "92%", s: 16 },
    { x: "92%", y: "88%", s: 13 },
    { x: "10%", y: "14%", s: 8 },
    { x: "86%", y: "18%", s: 9 },
    { x: "14%", y: "72%", s: 7 },
    { x: "84%", y: "66%", s: 10 },
    { x: "3%", y: "38%", s: 6 },
    { x: "97%", y: "44%", s: 7 },
    { x: "24%", y: "3%", s: 9 },
    { x: "76%", y: "94%", s: 8 },
    { x: "34%", y: "96%", s: 6 },
    { x: "66%", y: "2%", s: 7 },
    { x: "20%", y: "32%", s: 5, o: 0.75 },
    { x: "78%", y: "36%", s: 6, o: 0.8 },
    { x: "42%", y: "8%", s: 5, o: 0.7 },
    { x: "58%", y: "90%", s: 5, o: 0.75 },
    { x: "8%", y: "55%", s: 4, o: 0.65 },
    { x: "94%", y: "58%", s: 5, o: 0.7 },
    { x: "48%", y: "4%", s: 4, o: 0.6 },
    { x: "52%", y: "96%", s: 4, o: 0.65 },
  ],
};

function Pearl({ spec }: { spec: PearlSpec }) {
  const { x, y, s, o = 0.92 } = spec;
  return (
    <span
      className="pointer-events-none absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: s,
        height: s,
        opacity: o,
        background:
          "radial-gradient(circle at 32% 28%, #ffffff 0%, #faf6ef 38%, #ebe3d4 72%, #d9cfc0 100%)",
        boxShadow: `${Math.round(s * 0.12)}px ${Math.round(s * 0.18)}px ${Math.round(s * 0.35)}px rgba(43,35,28,0.2), inset -1px -2px 3px rgba(43,35,28,0.06)`,
      }}
      aria-hidden="true"
    />
  );
}

export function PearlScatter({
  density = "medium",
  corners = "all",
  className,
}: PearlScatterProps) {
  const pearls = PEARL_SETS[density].filter((p) => {
    const yNum = parseFloat(p.y);
    if (corners === "top") return yNum < 55;
    if (corners === "bottom") return yNum > 45;
    return true;
  });

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {pearls.map((spec, i) => (
        <Pearl key={`${spec.x}-${spec.y}-${i}`} spec={spec} />
      ))}
    </div>
  );
}
