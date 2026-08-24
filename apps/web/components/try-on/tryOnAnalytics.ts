import { API_URL } from "@/lib/api/client";

export type TryOnEventType =
  | "open"
  | "camera_start"
  | "photo_upload"
  | "try_on_success"
  | "product_change"
  | "share"
  | "order_click"
  | "order_completed";

const SESSION_KEY = "alankara-tryon-session";

export function getTryOnSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `try-${crypto.randomUUID?.() ?? String(Date.now())}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackTryOnEvent(
  eventType: TryOnEventType,
  productId?: string,
): Promise<void> {
  try {
    if (!API_URL) return;
    await fetch(`${API_URL}/try-on/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sessionId: getTryOnSessionId(),
        productId: productId ?? null,
        eventType,
      }),
      keepalive: true,
    });
  } catch {
    // Analytics must never block the try-on UX.
  }
}
