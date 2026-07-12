"use client";

import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sendFaqChatMessage, AiApiError, type FaqChatMessage } from "@/lib/api/ai";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "How long does shipping take?",
  "What is your return policy?",
  "How do I care for embroidered fabric pieces?",
  "Do you offer gift wrapping?",
];

const OUT_OF_KB_MARKERS = ["i'm not sure", "hello@alankara.com"] as const;

const SESSION_KEY = "alankara-faq-session";

function isOutOfKnowledgeBase(content: string): boolean {
  const lower = content.toLowerCase();
  return OUT_OF_KB_MARKERS.every((marker) => lower.includes(marker));
}

type ChatBubbleProps = {
  message: FaqChatMessage;
};

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isFallback = !isUser && isOutOfKnowledgeBase(message.content);

  return (
    <div
      className={cn(
        "max-w-[92%] rounded-sm px-3 py-2.5 text-sm leading-relaxed",
        isUser && "ml-auto bg-maroon text-ivory",
        !isUser && !isFallback && "mr-auto border border-sage/40 bg-ivory text-ink",
        isFallback &&
          "mr-auto border border-champagne/50 bg-gradient-to-br from-linen to-cotton text-ink",
      )}
      aria-label={isUser ? "Your message" : isFallback ? "Assistant fallback reply" : "Assistant reply"}
    >
      {isFallback && (
        <p className="mb-1.5 flex items-center gap-1.5 font-body text-[10px] uppercase tracking-widest text-olive">
          <Sparkles className="h-3 w-3 text-champagne" aria-hidden="true" />
          Outside our knowledge base
        </p>
      )}
      {message.content}
    </div>
  );
}

export function FaqChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<FaqChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionId(stored);
    }
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

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
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "border border-champagne/40 bg-maroon text-ivory shadow-luxury transition-transform motion-safe:hover:scale-105",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-linen",
        )}
        aria-label={open ? "Close FAQ chat" : "Open FAQ chat"}
        aria-expanded={open}
        aria-controls="faq-chat-panel"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="faq-chat-panel"
          className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-3rem,24rem)] flex-col overflow-hidden rounded-sm border border-sage/40 bg-ivory shadow-luxury-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-chat-title"
          aria-describedby="faq-chat-desc"
        >
          <header className="border-b border-sage/30 bg-gradient-to-r from-linen via-ivory to-cotton px-4 py-3">
            <p id="faq-chat-title" className="font-display text-sm tracking-wide text-maroon">
              Alankara Concierge
            </p>
            <p id="faq-chat-desc" className="font-body text-[10px] uppercase tracking-widest text-olive">
              Answers from our FAQ knowledge base
            </p>
          </header>

          <div
            ref={scrollRef}
            className="flex max-h-72 flex-1 flex-col gap-3 overflow-y-auto p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Chat messages"
          >
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="font-body text-sm text-ink-muted">
                  Ask about shipping, returns, fabric care, or sizing. I answer only from our
                  published FAQ — for anything else, I&apos;ll connect you with our team.
                </p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendMessage(q)}
                      className="rounded-sm border border-sage/40 bg-linen px-2.5 py-1.5 text-left font-body text-xs text-ink transition-colors hover:border-champagne hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatBubble key={`${msg.role}-${i}`} message={msg} />
            ))}

            {typing && (
              <div
                className="mr-auto flex items-center gap-2 rounded-sm border border-sage/40 bg-linen px-3 py-2"
                aria-label="Assistant is typing"
                role="status"
              >
                <span className="sr-only">Assistant is typing</span>
                <span className="motion-reduce:animate-none h-1.5 w-1.5 animate-bounce rounded-full bg-champagne [animation-delay:0ms]" />
                <span className="motion-reduce:animate-none h-1.5 w-1.5 animate-bounce rounded-full bg-champagne [animation-delay:150ms]" />
                <span className="motion-reduce:animate-none h-1.5 w-1.5 animate-bounce rounded-full bg-champagne [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {error && (
            <p className="px-4 pb-2 font-body text-xs text-error" role="alert">
              {error}
            </p>
          )}

          <form
            className="flex gap-2 border-t border-sage/30 bg-linen/50 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <label htmlFor="faq-chat-input" className="sr-only">
              Your question
            </label>
            <input
              ref={inputRef}
              id="faq-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              disabled={loading}
              autoComplete="off"
              className="flex-1 rounded-sm border border-sage/40 bg-ivory px-3 py-2 font-body text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-sm bg-maroon px-3 py-2 text-ivory disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
