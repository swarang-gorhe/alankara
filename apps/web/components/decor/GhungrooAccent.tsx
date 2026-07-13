import { cn } from "@/lib/utils";

type GhungrooAccentProps = {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
};

/** Small gold ghungroo bell — poster-style metallic accent */
export function GhungrooBell({ className, size = 16, style }: GhungrooAccentProps) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 20 27"
      fill="none"
      className={cn("drop-shadow-[0_2px_4px_rgba(43,35,28,0.15)]", className)}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ghungroo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C56A" />
          <stop offset="45%" stopColor="#C9932F" />
          <stop offset="100%" stopColor="#A67A28" />
        </linearGradient>
      </defs>
      <ellipse cx="10" cy="6" rx="7" ry="5" fill="url(#ghungroo-gold)" />
      <path
        d="M4 8 Q10 14 16 8 L15 22 Q10 26 5 22 Z"
        fill="url(#ghungroo-gold)"
        stroke="#A67A28"
        strokeWidth="0.4"
      />
      <circle cx="10" cy="24" r="1.2" fill="#8A6520" />
    </svg>
  );
}

type GhungrooScatterProps = {
  className?: string;
  count?: number;
};

const SCATTER_POSITIONS = [
  { left: "7%", top: "28%", size: 14, rotate: -8 },
  { left: "92%", top: "22%", size: 12, rotate: 0 },
  { left: "11%", top: "78%", size: 13, rotate: 6 },
  { left: "88%", top: "74%", size: 15, rotate: 0 },
  { left: "18%", top: "48%", size: 10, rotate: 10 },
  { left: "84%", top: "50%", size: 11, rotate: 0 },
];

export function GhungrooScatter({ className, count = 4 }: GhungrooScatterProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      {SCATTER_POSITIONS.slice(0, count).map((pos, i) => (
        <GhungrooBell
          key={i}
          size={pos.size}
          className="absolute opacity-85"
          style={{
            left: pos.left,
            top: pos.top,
            transform: `rotate(${pos.rotate}deg)`,
            transformOrigin: "center center",
          }}
        />
      ))}
    </div>
  );
}
