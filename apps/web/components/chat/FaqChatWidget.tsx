"use client";

import { Instagram, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlowerMotif } from "@/components/brand/FlowerMotif";
import { sendFaqChatMessage, AiApiError, type FaqChatMessage } from "@/lib/api/ai";
import {
  BRAND_EMAIL,
  BRAND_INSTAGRAM_URL,
  BRAND_PHONE_DISPLAY,
  BRAND_PHONE_TEL,
  matchLocalFaq,
} from "@/lib/chat/localFaq";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "Which earrings are lightweight?",
  "Can I customize a design?",
  "How do I care for fabric jewellery?",
  "How long does delivery take?",
  "How can I choose a fabric?",
];

const SESSION_KEY = "alankara-faq-session";

function ChatBubble({ message }: { message: FaqChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "max-w-[92%] px-3.5 py-2.5 text-sm leading-relaxed",
        isUser && "ml-auto bg-maroon text-ivory",
        !isUser && "mr-auto border border-champagne/35 bg-linen/80 text-ink",
      )}
      aria-label={isUser ? "Your message" : "Assistant reply"}
    >
      {message.content}
    </div>
  );
}

function newLocalSessionId(): string {
  return `local-${crypto.randomUUID?.() ?? String(Date.now())}`;
}

export function FaqChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<FaqChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) setSessionId(stored);
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

  const replyLocally = useCallback((trimmed: string, sid: string) => {
    const { answer } = matchLocalFaq(trimmed);
    setSessionId(sid);
    sessionStorage.setItem(SESSION_KEY, sid);
    setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setNotice(null);
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);
      setTyping(true);

      const fallbackSession = sessionId ?? newLocalSessionId();

      try {
        const response = await sendFaqChatMessage(trimmed, sessionId);
        setSessionId(response.sessionId);
        sessionStorage.setItem(SESSION_KEY, response.sessionId);
        setMessages((prev) => [...prev, { role: "assistant", content: response.answer }]);
      } catch (err) {
        // Always answer — production often lacks AI keys or a reachable API.
        replyLocally(trimmed, fallbackSession);
        if (err instanceof AiApiError && err.status === 503) {
          setNotice("Atelier guide is answering from our notes while the AI concierge rests.");
        }
      } finally {
        setLoading(false);
        setTyping(false);
      }
    },
    [loading, replyLocally, sessionId],
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex items-center gap-3 border border-champagne/45",
          "bg-ivory/95 px-3.5 py-2.5 text-maroon shadow-[0_12px_40px_-18px_rgba(111,35,23,0.45)] backdrop-blur-md",
          "transition-transform motion-safe:hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-linen",
        )}
        aria-label={open ? "Close Alankara assistant" : "Open Alankara assistant"}
        aria-expanded={open}
        aria-controls="faq-chat-panel"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <>
            <span className="flex h-9 w-9 items-center justify-center border border-champagne/40 bg-gradient-to-br from-linen to-cotton">
              <FlowerMotif className="h-4 w-4" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block font-display text-[15px] leading-none">Concierge</span>
              <span className="mt-1 block font-body text-[10px] uppercase tracking-[0.18em] text-olive">
                Ask Alankara
              </span>
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          id="faq-chat-panel"
          className="fixed bottom-[4.75rem] right-5 z-50 flex w-[min(100vw-2.5rem,22.5rem)] flex-col overflow-hidden border border-champagne/40 bg-ivory shadow-[0_24px_60px_-28px_rgba(43,35,28,0.55)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-chat-title"
          aria-describedby="faq-chat-desc"
        >
          <header className="border-b border-champagne/30 bg-gradient-to-br from-linen via-ivory to-cotton px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p id="faq-chat-title" className="font-display text-base tracking-wide text-maroon">
                  Alankara Concierge
                </p>
                <p
                  id="faq-chat-desc"
                  className="mt-1 font-body text-[10px] uppercase tracking-[0.16em] text-olive"
                >
                  Little moments, answered with care
                </p>
              </div>
              <FlowerMotif className="mt-0.5 h-5 w-5 shrink-0 text-champagne" />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-body text-[11px] text-ink-muted">
              <a href={BRAND_PHONE_TEL} className="hover:text-maroon">
                {BRAND_PHONE_DISPLAY}
              </a>
              <span aria-hidden>·</span>
              <a href={`mailto:${BRAND_EMAIL}`} className="hover:text-maroon">
                Email
              </a>
              <span aria-hidden>·</span>
              <a
                href={BRAND_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-maroon"
              >
                <Instagram className="h-3 w-3" aria-hidden />
                Instagram
              </a>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex max-h-[min(52vh,22rem)] flex-1 flex-col gap-3 overflow-y-auto bg-[linear-gradient(180deg,rgba(250,243,231,0.4),transparent)] p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Chat messages"
          >
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="font-body text-sm leading-relaxed text-ink-muted">
                  Ask about fabric, care, custom colour, or delivery — or tap a prompt below.
                </p>
                <div className="flex flex-col gap-2" role="group" aria-label="Suggested questions">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendMessage(q)}
                      disabled={loading}
                      className="border border-champagne/30 bg-linen/70 px-3 py-2.5 text-left font-body text-xs text-ink transition-colors hover:border-champagne hover:bg-ivory disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
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
                className="mr-auto flex items-center gap-2 border border-champagne/30 bg-linen px-3 py-2"
                aria-label="Assistant is typing"
                role="status"
              >
                <span className="sr-only">Assistant is typing</span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-champagne [animation-delay:0ms] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-champagne [animation-delay:150ms] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-champagne [animation-delay:300ms] motion-reduce:animate-none" />
              </div>
            )}
          </div>

          {notice && (
            <p className="border-t border-champagne/20 bg-linen/60 px-4 py-2 font-body text-[11px] text-olive">
              {notice}
            </p>
          )}

          <form
            className="flex gap-2 border-t border-champagne/30 bg-linen/40 p-3"
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
              className="flex-1 border border-champagne/35 bg-ivory px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-maroon px-3.5 py-2.5 text-ivory transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
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
