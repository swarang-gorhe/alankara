import { INTRO_STORAGE_KEY } from "./constants";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    // Storage unavailable — skip silently
  }
}

export function clearIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(INTRO_STORAGE_KEY);
  } catch {
    // Storage unavailable — skip silently
  }
}
