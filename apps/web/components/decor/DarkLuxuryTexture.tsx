import { cn } from "@/lib/utils";

type DarkLuxuryTextureProps = {
  className?: string;
  /** Warm raking light from top-left */
  vignette?: boolean;
};

/** Woven linen + vignette overlay for deep-wine sections */
export function DarkLuxuryTexture({ className, vignette = true }: DarkLuxuryTextureProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23C9A227' stroke-width='0.5' fill='none' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />
      {vignette && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 30% 20%, rgba(201,162,39,0.12) 0%, transparent 55%), radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)",
          }}
        />
      )}
    </div>
  );
}
