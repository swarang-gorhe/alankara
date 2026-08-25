/**
 * Dev debug overlay for try-on landmarks.
 * Enable with any of:
 * - NODE_ENV === "development"
 * - URL ?tryonDebug=1
 * - localStorage.setItem("tryonDebug", "1")
 */
export function isTryOnDebugEnabled(): boolean {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }
  if (process.env.NODE_ENV === "development") return true;
  try {
    if (new URLSearchParams(window.location.search).get("tryonDebug") === "1") {
      return true;
    }
    if (window.localStorage.getItem("tryonDebug") === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}
