import { cn } from "@/lib/utils";

type FabricTextureProps = {
  className?: string;
  opacity?: number;
  /** Unique id prefix when multiple overlays share a page */
  id?: string;
};

/**
 * Tileable fabric weave + fine noise overlay for luxury cloth-brand surfaces.
 */
export function FabricTexture({ className, opacity = 0.07, id = "fabric" }: FabricTextureProps) {
  const weaveId = `${id}-weave`;
  const noiseId = `${id}-noise`;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={weaveId}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(38)"
          >
            <line x1="0" y1="0" x2="0" y2="14" stroke="#C9932F" strokeWidth="0.45" opacity="0.35" />
            <line x1="7" y1="0" x2="7" y2="14" stroke="#6B7353" strokeWidth="0.3" opacity="0.25" />
          </pattern>
          <filter id={noiseId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
            <feBlend in="SourceGraphic" in2="mono" mode="multiply" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${weaveId})`} filter={`url(#${noiseId})`} />
      </svg>
    </div>
  );
}

/** Alias for shared texture layer naming in the design brief */
export const TextureOverlay = FabricTexture;
