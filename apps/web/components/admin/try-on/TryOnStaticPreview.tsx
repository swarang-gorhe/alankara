"use client";

/** Sample-face ear anchors as % of the preview box (matches /try-on/sample-face.svg). */
const LEFT_EAR = { x: 22, y: 49 };
const RIGHT_EAR = { x: 78, y: 49 };
const BASE_EARRING_WIDTH_PCT = 14;

export type TryOnPreviewValues = {
  tryOnAssetUrl?: string | null;
  tryOnScale: number;
  tryOnLeftOffsetX: number;
  tryOnLeftOffsetY: number;
  tryOnRightOffsetX: number;
  tryOnRightOffsetY: number;
  tryOnRotation: number;
  tryOnVerticalOffset: number;
};

type TryOnStaticPreviewProps = {
  values: TryOnPreviewValues;
  className?: string;
};

function EarringSprite({
  side,
  values,
}: {
  side: "left" | "right";
  values: TryOnPreviewValues;
}) {
  if (!values.tryOnAssetUrl) return null;

  const base = side === "left" ? LEFT_EAR : RIGHT_EAR;
  const offsetX = side === "left" ? values.tryOnLeftOffsetX : values.tryOnRightOffsetX;
  const offsetY = side === "left" ? values.tryOnLeftOffsetY : values.tryOnRightOffsetY;
  const width = BASE_EARRING_WIDTH_PCT * (values.tryOnScale || 1);
  const left = base.x + offsetX;
  const top = base.y + offsetY + values.tryOnVerticalOffset;
  const flip = side === "left" ? "scaleX(-1)" : "scaleX(1)";
  const rotate = `rotate(${values.tryOnRotation}deg)`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={values.tryOnAssetUrl}
      alt=""
      aria-hidden
      className="pointer-events-none absolute origin-top object-contain drop-shadow-sm"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        transform: `translate(-50%, 0) ${flip} ${rotate}`,
      }}
    />
  );
}

export function TryOnStaticPreview({ values, className }: TryOnStaticPreviewProps) {
  return (
    <div
      className={
        className ??
        "relative aspect-[400/520] w-full overflow-hidden rounded border border-admin-border bg-[#FAF3E7]"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/try-on/sample-face.svg"
        alt="Sample face for earring calibration"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <EarringSprite side="left" values={values} />
      <EarringSprite side="right" values={values} />
      {!values.tryOnAssetUrl && (
        <div className="absolute inset-x-0 bottom-4 text-center">
          <p className="font-display text-sm text-maroon/70">Upload a try-on asset to preview</p>
        </div>
      )}
    </div>
  );
}
