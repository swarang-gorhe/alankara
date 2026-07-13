import { cn } from "@/lib/utils";

type IconProps = { className?: string; size?: number };

/** Gold line icons from Our Craft poster */
export function ScissorsIcon({ className, size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="5" stroke="#C9932F" strokeWidth="1.2" />
      <circle cx="8" cy="24" r="5" stroke="#C9932F" strokeWidth="1.2" />
      <path d="M12 11 L28 28" stroke="#C9932F" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 21 L28 4" stroke="#C9932F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function LeafSprigIcon({ className, size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M6 26 Q12 20 16 14 Q20 8 26 6" stroke="#C9932F" strokeWidth="1.2" fill="none" />
      <path d="M16 14 Q20 16 24 14" stroke="#C9932F" strokeWidth="1" fill="none" />
      <path d="M12 18 Q16 20 20 18" stroke="#C9932F" strokeWidth="1" fill="none" />
      <ellipse cx="22" cy="10" rx="4" ry="6" stroke="#C9932F" strokeWidth="1" transform="rotate(-30 22 10)" />
      <ellipse cx="14" cy="16" rx="3.5" ry="5" stroke="#C9932F" strokeWidth="1" transform="rotate(-15 14 16)" />
    </svg>
  );
}

export function SpoolIcon({ className, size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <ellipse cx="16" cy="8" rx="10" ry="4" stroke="#C9932F" strokeWidth="1.2" />
      <path d="M6 8 L6 24 Q6 28 16 28 Q26 28 26 24 L26 8" stroke="#C9932F" strokeWidth="1.2" fill="none" />
      <ellipse cx="16" cy="24" rx="10" ry="4" stroke="#C9932F" strokeWidth="1.2" />
      <path d="M6 16 L26 16" stroke="#C9932F" strokeWidth="0.8" strokeDasharray="2 2" />
    </svg>
  );
}

type CraftPillarsProps = { className?: string };

const PILLARS = [
  { icon: ScissorsIcon, label: "Handmade" },
  { icon: LeafSprigIcon, label: "Thoughtfully designed" },
  { icon: SpoolIcon, label: "Made in small batches" },
];

export function CraftPillars({ className }: CraftPillarsProps) {
  return (
    <ul className={cn("space-y-0", className)}>
      {PILLARS.map(({ icon: Icon, label }, i) => (
        <li key={label}>
          {i > 0 && (
            <div className="my-4 flex justify-center md:justify-start">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne/30 bg-ivory/80 shadow-[0_2px_12px_rgba(201,147,47,0.12)]">
              <Icon size={28} />
            </div>
            <span className="font-display text-lg text-maroon md:text-xl">{label}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
