import Image from "next/image";
import { cn } from "@/lib/utils";
import { LOGO_MARK_SRC } from "@/components/brand/AnimatedLogo";

type WaxSealProps = {
  className?: string;
  size?: number;
};

/** Embossed wax-seal motif using the Alankara medallion mark — packaging / gift-note accent */
export function WaxSeal({ className, size = 56 }: WaxSealProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-aged-burgundy via-deep-wine to-aged-burgundy",
        "shadow-[inset_0_2px_4px_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.35)]",
        "ring-2 ring-antique-gold/40 ring-offset-2 ring-offset-kraft-cream",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src={LOGO_MARK_SRC}
        alt=""
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
        className="object-contain opacity-90 brightness-110"
      />
    </div>
  );
}
