import { cn } from "@/lib/utils";

type BotanicalSprigProps = {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: number;
};

/** Baby's breath corner accent — delicate dried-floral sprig */
export function BotanicalSprig({
  className,
  position = "top-left",
  size = 120,
}: BotanicalSprigProps) {
  const flipX = position.includes("right");
  const flipY = position.includes("bottom");

  const positionClasses = {
    "top-left": "left-0 top-0",
    "top-right": "right-0 top-0",
    "bottom-left": "left-0 bottom-0",
    "bottom-right": "right-0 bottom-0",
  };

  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 120 102"
      fill="none"
      className={cn(
        "pointer-events-none absolute opacity-90",
        positionClasses[position],
        className,
      )}
      style={{
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
        transformOrigin: flipX ? "right" : "left",
      }}
      aria-hidden="true"
    >
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
    </svg>
  );
}
