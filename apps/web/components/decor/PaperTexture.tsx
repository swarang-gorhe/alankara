import { cn } from "@/lib/utils";

type PaperTextureProps = {
  className?: string;
  variant?: "cream" | "linen" | "cotton";
};

const variantStyles = {
  cream: "from-ivory via-[#FAF3E7] to-ivory",
  linen: "from-linen via-[#F0E0C8] to-linen",
  cotton: "from-cotton via-[#EDE5D6] to-cotton",
};

/** Warm paper background with subtle grain — not flat single colour */
export function PaperTexture({ className, variant = "cream" }: PaperTextureProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", variantStyles[variant])} />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(201,147,47,0.08) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
