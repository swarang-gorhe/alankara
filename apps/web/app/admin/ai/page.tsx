"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAgentActions,
  runAdminAgentAction,
  triggerKnowledgeReindex,
  type AgentAction,
  type AdminAgentResponse,
} from "@/lib/api/ai";

const AGENT_META: Record<string, { title: string; description: string }> = {
  product: {
    title: "Product Writing",
    description: "Luxury descriptions, SEO meta, alt text, and social captions for textile jewellery.",
  },
  inventory: {
    title: "Inventory",
    description: "Low stock reports, restock suggestions, and sales velocity analysis.",
  },
  marketing: {
    title: "Marketing",
    description: "Instagram, festival campaigns, WhatsApp broadcasts, and slow-mover promos.",
  },
  reviews: {
    title: "Reviews",
    description: "Sentiment summaries, complaint flags, trending keywords, and response drafts.",
  },
};

export default function AdminAiPage() {
  const [actions, setActions] = useState<Record<string, AgentAction[]>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<AdminAgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    fetchAgentActions().then(setActions).catch(() => setError("Failed to load agent actions"));
  }, []);

  const runAction = useCallback(async (agentType: string, actionId: string) => {
    setLoading(`${agentType}:${actionId}`);
    setError(null);
    setResult(null);
    try {
      const response = await runAdminAgentAction(
        agentType as "product" | "inventory" | "marketing" | "reviews",
        actionId,
      );
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setLoading(null);
    }
  }, []);

  const handleReindex = async () => {
    setReindexing(true);
    setError(null);
    try {
      const response = await triggerKnowledgeReindex();
      setResult({
        agentType: "reindex",
        action: null,
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-admin-text">AI Agents</h1>
          <p className="mt-1 text-sm text-admin-muted">
            Audited tool-calling agents — explicit actions only, no database writes
          </p>
        </div>
        <button
          type="button"
          disabled={reindexing}
          onClick={() => void handleReindex()}
          className="rounded border border-admin-border px-4 py-2 text-xs uppercase tracking-widest text-admin-muted hover:border-admin-accent/40 hover:text-admin-text disabled:opacity-50"
        >
          {reindexing ? "Queuing…" : "Re-index knowledge base"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(AGENT_META).map(([agentType, meta]) => (
          <section
            key={agentType}
            className="rounded-lg border border-admin-border bg-admin-surface p-6"
          >
            <h2 className="font-display text-lg text-admin-accent">{meta.title}</h2>
            <p className="mt-1 text-xs text-admin-muted">{meta.description}</p>
            <div className="mt-4 space-y-2">
              {(actions[agentType] ?? []).map((action) => {
                const isRunning = loading === `${agentType}:${action.id}`;
                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={!!loading}
                    onClick={() => void runAction(agentType, action.id)}
                    className="flex w-full items-center justify-between rounded border border-admin-border bg-admin-elevated px-4 py-3 text-left text-sm transition-colors hover:border-admin-accent/40 disabled:opacity-50"
                  >
                    <span className="text-admin-text">{action.label}</span>
                    <span className="text-[10px] uppercase tracking-widest text-admin-muted">
                      {isRunning ? "Running…" : "Run"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger">
          {error}
        </div>
      )}

      {result && (
        <section className="rounded-lg border border-admin-border bg-admin-surface p-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-admin-accent">
              {result.agentType}
              {result.action ? ` · ${result.action}` : ""}
            </span>
            <span className="text-[10px] text-admin-muted">Log: {result.logId}</span>
          </div>
          {result.toolsCalled && result.toolsCalled.length > 0 && (
            <p className="mt-2 text-[10px] text-admin-muted">
              Tools: {result.toolsCalled.join(", ")}
            </p>
          )}
          <pre className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-body text-sm text-admin-text">
            {result.result}
          </pre>
        </section>
      )}
    </div>
  );
}
