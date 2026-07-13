import { cn } from "@/lib/utils";

type BotanicalSprigProps = {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: number;
};

const positionClasses = {
  "top-left": "left-0 top-0",
  "top-right": "right-0 top-0",
  "bottom-left": "left-0 bottom-0",
  "bottom-right": "right-0 bottom-0",
} as const;

/** Baby's breath corner accent — mirrored via SVG transform (no CSS scale tilt) */
export function BotanicalSprig({
  className,
  position = "top-left",
  size = 120,
}: BotanicalSprigProps) {
  const flipX = position.includes("right");
  const flipY = position.includes("bottom");

  let groupTransform = "";
  if (flipX && flipY) {
    groupTransform = "translate(120 102) scale(-1 -1)";
  } else if (flipX) {
    groupTransform = "translate(120 0) scale(-1 1)";
  } else if (flipY) {
    groupTransform = "translate(0 102) scale(1 -1)";
  }

  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 120 102"
      fill="none"
      className={cn(
        "pointer-events-none absolute rotate-0 opacity-90",
        positionClasses[position],
        className,
      )}
      style={{ transform: "none" }}
      aria-hidden="true"
    >
      <g transform={groupTransform || undefined}>
        <path
          d="M8 95 Q20 70 35 55 Q50 40 62 30 Q74 20 88 12"
          stroke="#8B7355"
          strokeWidth="1.2"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M15 88 Q28 65 42 50 Q55 35 70 22"
          stroke="#A08B6E"
          strokeWidth="0.8"
          fill="none"
          opacity="0.45"
        />
        {[
          [12, 82, 3.5],
          [22, 68, 4],
          [32, 54, 3],
          [42, 42, 4.5],
          [52, 32, 3.5],
          [62, 24, 4],
          [72, 18, 3],
          [82, 14, 3.5],
          [18, 74, 2.5],
          [28, 60, 3],
          [38, 48, 2.5],
          [48, 36, 3],
          [58, 28, 2.5],
          [68, 20, 3],
          [78, 16, 2.5],
          [88, 10, 3],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="#F5F0E8" opacity="0.95" />
            <circle cx={cx} cy={cy} r={r * 0.6} fill="#FFFFFF" />
          </g>
        ))}
      </g>
    </svg>
  );
}
