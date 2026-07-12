"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sendFaqChatMessage, AiApiError, type FaqChatMessage } from "@/lib/api/ai";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "How long does shipping take?",
  "What is your return policy?",
  "How do I care for kundan jewellery?",
  "Do you offer gift wrapping?",
];

const SESSION_KEY = "alankara-faq-session";

export function FaqChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<FaqChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionId(stored);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);
      setTyping(true);

      try {
        const response = await sendFaqChatMessage(trimmed, sessionId);
        setSessionId(response.sessionId);
        sessionStorage.setItem(SESSION_KEY, response.sessionId);
        setMessages((prev) => [...prev, { role: "assistant", content: response.answer }]);
      } catch (err) {
        const msg =
          err instanceof AiApiError && err.status === 503
            ? "Our assistant is resting — please email hello@alankara.com for help."
            : "Something went wrong. Please try again or contact our team.";
        setError(msg);
      } finally {
        setLoading(false);
        setTyping(false);
      }
    },
    [loading, sessionId],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "border border-gold/40 bg-maroon text-cream-light shadow-lg transition-transform hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-cream",
        )}
        aria-label={open ? "Close FAQ chat" : "Open FAQ chat"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-3rem,24rem)] flex-col overflow-hidden rounded-sm border border-gold/30 bg-cream-light shadow-2xl"
          role="dialog"
          aria-label="Alankara FAQ assistant"
        >
          <header className="border-b border-gold/20 bg-gradient-to-r from-maroon to-maroon-deep px-4 py-3 text-cream-light">
            <p className="font-display text-sm tracking-wide">Alankara Concierge</p>
            <p className="text-[10px] uppercase tracking-widest text-gold/80">FAQ assistant</p>
          </header>

          <div ref={scrollRef} className="flex max-h-72 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-charcoal-muted">
                  Ask about shipping, returns, care, or sizing — I answer from our knowledge base only.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendMessage(q)}
                      className="rounded-sm border border-gold/30 bg-cream px-2 py-1 text-left text-xs text-charcoal hover:border-gold"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={cn(
                  "max-w-[90%] rounded-sm px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-maroon text-cream-light"
                    : "mr-auto border border-gold/20 bg-cream text-charcoal",
                )}
              >
                {msg.content}
              </div>
            ))}

            {typing && (
              <div className="mr-auto flex gap-1 rounded-sm border border-gold/20 bg-cream px-3 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {error && <p className="px-4 pb-2 text-xs text-maroon">{error}</p>}

          <form
            className="flex gap-2 border-t border-gold/20 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <label htmlFor="faq-chat-input" className="sr-only">
              Your question
            </label>
            <input
              id="faq-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              disabled={loading}
              className="flex-1 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-sm bg-maroon px-3 py-2 text-cream-light disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
