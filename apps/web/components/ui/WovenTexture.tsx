import { cn } from "@/lib/utils";

type WovenTextureProps = {
  className?: string;
  opacity?: number;
};

export function WovenTexture({ className, opacity = 0.08 }: WovenTextureProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="woven-grid"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="12" stroke="#b98a4a" strokeWidth="0.5" />
            <line x1="6" y1="0" x2="6" y2="12" stroke="#c9932f" strokeWidth="0.3" />
          </pattern>
          <pattern
            id="woven-cross"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <rect width="24" height="24" fill="url(#woven-grid)" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="#b98a4a" strokeWidth="0.25" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="#b98a4a" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#woven-cross)" />
      </svg>
    </div>
  );
}
