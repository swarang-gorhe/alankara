import { API_URL } from "@/lib/api/client";
import type { AIInsightsFixture } from "@/lib/fixtures/types";

export type FaqChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type FaqChatResponse = {
  answer: string;
  sources: Array<{ sourceType?: string; sourceId?: string; excerpt: string }>;
  sessionId: string;
};

export type ReviewSummaryResponse = {
  productId: string;
  summary: string;
  generatedAt: string;
};

export type AgentAction = {
  id: string;
  label: string;
};

export type AdminAgentResponse = {
  agentType: string;
  action: string | null;
  result: string;
  toolsCalled?: unknown[];
  logId: string;
};

export class AiApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AiApiError";
  }
}

export async function fetchReviewInsights(): Promise<AIInsightsFixture> {
  const res = await fetch(`${API_URL}/reviews/insights`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new AiApiError("Failed to load review insights", res.status);
  }
  return res.json() as Promise<AIInsightsFixture>;
}

export async function fetchProductReviewSummary(
  slug: string,
): Promise<ReviewSummaryResponse | null> {
  const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}/review-summary`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new AiApiError("Failed to load review summary", res.status);
  }
  return res.json() as Promise<ReviewSummaryResponse>;
}

export async function sendFaqChatMessage(
  message: string,
  sessionId?: string,
): Promise<FaqChatResponse> {
  const res = await fetch(`${API_URL}/chat/faq`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new AiApiError(body || "Chat unavailable", res.status);
  }
  return res.json() as Promise<FaqChatResponse>;
}

export async function fetchAgentActions(): Promise<Record<string, AgentAction[]>> {
  const { adminFetch } = await import("@/lib/api/admin");
  const data = await adminFetch<{ agents: Record<string, AgentAction[]> }>("/admin/ai/actions");
  return data.agents;
}

export async function runAdminAgentAction(
  agentType: "product" | "inventory" | "marketing" | "reviews",
  action: string,
): Promise<AdminAgentResponse> {
  const { adminFetch } = await import("@/lib/api/admin");
  return adminFetch<AdminAgentResponse>(`/admin/ai/agents/${agentType}`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

/** Legacy panel helper — maps free-text prompt to agent action endpoint */
export async function runAdminAgent(
  agentType: "product" | "inventory" | "marketing" | "reviews" | "image",
  prompt: string,
): Promise<AdminAgentResponse> {
  if (agentType === "image") {
    return {
      agentType,
      action: null,
      result: "Image prep agent will be wired in Phase 7.",
      logId: "stub",
    };
  }
  return runAdminAgentAction(agentType, prompt);
}

export async function triggerKnowledgeReindex(): Promise<{ taskId?: string; message: string }> {
  const { adminFetch } = await import("@/lib/api/admin");
  return adminFetch<{ taskId?: string; message: string }>("/admin/ai/reindex", {
    method: "POST",
  });
}

export async function regenerateProductReviewSummary(
  productId: string,
): Promise<{ taskId?: string; message: string }> {
  const { adminFetch } = await import("@/lib/api/admin");
  return adminFetch<{ taskId?: string; message: string }>(
    `/admin/products/${productId}/reviews/summarize/regenerate`,
    { method: "POST" },
  );
}

export async function summarizeProductReviews(
  productId: string,
): Promise<ReviewSummaryResponse> {
  const { adminFetch } = await import("@/lib/api/admin");
  return adminFetch<ReviewSummaryResponse>(
    `/admin/products/${productId}/reviews/summarize`,
    { method: "POST" },
  );
}
