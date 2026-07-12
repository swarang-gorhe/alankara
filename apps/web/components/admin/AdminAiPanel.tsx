"use client";

import { useState } from "react";
import {
  runAdminAgent,
  triggerKnowledgeReindex,
  type AdminAgentResponse,
} from "@/lib/api/ai";
import { cn } from "@/lib/utils";

const AGENTS = [
  {
    id: "product" as const,
    label: "Product copy",
    prompt: "Draft a luxury product description for our bestselling pearl earrings.",
  },
  {
    id: "inventory" as const,
    label: "Inventory",
    prompt: "Which variants need restocking based on current stock and recent sales?",
  },
  {
    id: "marketing" as const,
    label: "Marketing",
    prompt: "Suggest a campaign to move slow inventory before the festive season.",
  },
  {
    id: "reviews" as const,
    label: "Reviews",
    prompt: "Flag reviews needing a response and draft a gracious reply for the most recent.",
  },
  {
    id: "image" as const,
    label: "Image prep",
    prompt: "Suggest crop presets for new product photography.",
  },
];

type AdminAiPanelProps = {
  className?: string;
};

export function AdminAiPanel({ className }: AdminAiPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [result, setResult] = useState<AdminAgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const runAgent = async (agentId: (typeof AGENTS)[number]["id"], prompt: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await runAdminAgent(agentId, prompt);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    setError(null);
    try {
      const response = await triggerKnowledgeReindex();
      setResult({
        agentType: "reindex",
        result: response.message,
        logId: response.taskId ?? "queued",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Re-index failed");
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-40", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-sm border border-gold/40 bg-maroon px-4 py-2 text-xs uppercase tracking-widest text-cream-light shadow-lg hover:bg-maroon-deep"
      >
        {open ? "Close AI" : "AI agents"}
      </button>

      {open && (
        <div className="mt-3 w-[min(100vw-3rem,22rem)] rounded-sm border border-gold/30 bg-cream-light p-4 shadow-xl">
          <p className="font-display text-sm text-maroon">Admin AI tools</p>
          <p className="mt-1 text-[10px] text-charcoal-muted">
            Audited tool calls — review before publishing
          </p>

          <div className="mt-4 space-y-2">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                type="button"
                disabled={loading}
                onClick={() => void runAgent(agent.id, customPrompt || agent.prompt)}
                className="w-full rounded-sm border border-gold/25 px-3 py-2 text-left text-xs hover:bg-cream disabled:opacity-50"
              >
                <span className="font-medium text-maroon">{agent.label}</span>
                <span className="mt-0.5 block text-charcoal-muted line-clamp-1">
                  {agent.prompt}
                </span>
              </button>
            ))}
          </div>

          <label className="mt-4 block text-[10px] uppercase tracking-widest text-gold">
            Custom prompt (optional)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-2 py-1.5 text-xs"
            placeholder="Override default agent prompt…"
          />

          <button
            type="button"
            disabled={reindexing}
            onClick={() => void handleReindex()}
            className="mt-3 w-full rounded-sm border border-dashed border-gold/40 py-2 text-xs uppercase tracking-widest text-charcoal hover:bg-cream"
          >
            {reindexing ? "Queuing…" : "Re-index knowledge base"}
          </button>

          {loading && <p className="mt-3 text-xs text-charcoal-muted">Running agent…</p>}
          {error && <p className="mt-3 text-xs text-maroon">{error}</p>}
          {result && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-sm border border-gold/20 bg-cream p-3 text-xs text-charcoal">
              <p className="text-[10px] uppercase tracking-widest text-gold">{result.agentType}</p>
              <pre className="mt-2 whitespace-pre-wrap font-body">{result.result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
