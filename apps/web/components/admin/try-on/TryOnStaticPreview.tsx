"use client";

/** Sample-face ear anchors as % of the preview box (matches /try-on/sample-face.svg). */
const LEFT_EAR = { x: 22, y: 49 };
const RIGHT_EAR = { x: 78, y: 49 };
const BASE_EARRING_WIDTH_PCT = 14;
/** Sample torso neck-base for necklace calibration preview. */
const NECK_BASE = { x: 50, y: 62 };
const BASE_NECKLACE_WIDTH_PCT = 42;

export type TryOnPreviewValues = {
  tryOnType?: "earring" | "necklace";
  tryOnAssetUrl?: string | null;
  tryOnScale: number;
  tryOnLeftOffsetX: number;
  tryOnLeftOffsetY: number;
  tryOnRightOffsetX: number;
  tryOnRightOffsetY: number;
  tryOnRotation: number;
  tryOnVerticalOffset: number;
  tryOnNecklaceAssetUrl?: string | null;
  tryOnNecklaceLengthOffset?: number;
  tryOnNecklaceScale?: number;
  tryOnNecklaceRotationOffset?: number;
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

function NecklaceSprite({ values }: { values: TryOnPreviewValues }) {
  const src = values.tryOnNecklaceAssetUrl || values.tryOnAssetUrl;
  if (!src) return null;

  const scale = values.tryOnNecklaceScale ?? values.tryOnScale ?? 1;
  const length = values.tryOnNecklaceLengthOffset ?? 0;
  const rotation = values.tryOnNecklaceRotationOffset ?? 0;
  const width = BASE_NECKLACE_WIDTH_PCT * scale;
  const left = NECK_BASE.x;
  const top = NECK_BASE.y + length;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      className="pointer-events-none absolute origin-top object-contain drop-shadow-md"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        transform: `translate(-50%, 0) rotate(${rotation}deg)`,
      }}
    />
  );
}

export function TryOnStaticPreview({ values, className }: TryOnStaticPreviewProps) {
  const isNecklace = values.tryOnType === "necklace";
  const hasAsset = isNecklace
    ? Boolean(values.tryOnNecklaceAssetUrl || values.tryOnAssetUrl)
    : Boolean(values.tryOnAssetUrl);

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
        alt={isNecklace ? "Sample torso for necklace calibration" : "Sample face for earring calibration"}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {isNecklace ? (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-[62%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-champagne"
            aria-hidden
          />
          <NecklaceSprite values={values} />
        </>
      ) : (
        <>
          <EarringSprite side="left" values={values} />
          <EarringSprite side="right" values={values} />
        </>
      )}
      {!hasAsset && (
        <div className="absolute inset-x-0 bottom-4 text-center">
          <p className="font-display text-sm text-maroon/70">Upload a try-on asset to preview</p>
        </div>
      )}
    </div>
  );
}
