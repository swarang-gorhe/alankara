"use client";

import { FlowerMotif } from "@/components/brand/FlowerMotif";
import type { TryOnErrorKind } from "./types";

const COPY: Record<
  TryOnErrorKind,
  { title: string; body: string; action?: string }
> = {
  camera_denied: {
    title: "Camera needs a quiet yes",
    body: "We never upload your live camera. Allow access in your browser settings, or switch to “Use a Photo” instead.",
    action: "Use a photo",
  },
  no_face: {
    title: "We can’t see you yet",
    body: "Face the light, centre your face in the frame, and hold still for a moment. Hair covering both ears can hide the anchors.",
  },
  poor_lighting: {
    title: "A little more light, please",
    body: "Soft daylight or a lamp in front of you helps the earrings sit true. Avoid strong backlight.",
  },
  one_ear: {
    title: "Turn a little toward us",
    body: "We can only place one earring when a profile hides the other ear. Face the camera more squarely for a full pair.",
  },
  unsupported: {
    title: "This device prefers photo mode",
    body: "Live try-on needs a modern browser with WebGL. You can still upload or take a photo — the result is just as lovely.",
    action: "Use a photo",
  },
  generic: {
    title: "A small pause at the table",
    body: "Something interrupted the try-on. Try again, or use a photo. We’re here if you need help.",
  },
};

type ErrorStatesProps = {
  kind: TryOnErrorKind;
  onAction?: () => void;
};

export function ErrorStates({ kind, onAction }: ErrorStatesProps) {
  const copy = COPY[kind];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-linen/90 px-6 text-center">
      <FlowerMotif className="h-8 w-8 text-champagne" />
      <h3 className="font-display text-2xl text-maroon">{copy.title}</h3>
      <p className="max-w-sm font-body text-sm leading-relaxed text-ink-muted">{copy.body}</p>
      {copy.action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 border border-maroon/30 bg-maroon px-4 py-2 font-body text-xs uppercase tracking-widest text-ivory"
        >
          {copy.action}
        </button>
      )}
    </div>
  );
}
