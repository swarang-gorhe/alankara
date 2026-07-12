export const INTRO_STORAGE_KEY = "alankara_intro_seen";

/** Pinned scroll distance as viewport heights */
export const INTRO_PIN_VH_DESKTOP = 450;
export const INTRO_PIN_VH_MOBILE = 280;

export const SKIP_INTRO_DELAY_MS = 2500;
export const RETURN_BLOOM_DURATION_MS = 2800;

/** Scroll progress breakpoints within the pinned sequence (0–1) */
export const INTRO_CHAPTER_BREAKS = {
  arrivalEnd: 0.18,
  untyingEnd: 0.38,
  openingEnd: 0.58,
  revealEnd: 0.78,
  transformEnd: 1,
} as const;

export const INTRO_PARTICLE_COUNT_DESKTOP = 120;
export const INTRO_PARTICLE_COUNT_MOBILE = 55;
