"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GrainOverlay } from "@/components/decor/GrainOverlay";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <div className="relative overflow-hidden bg-ivory">
      <GrainOverlay />
      <div className="relative mx-auto max-w-3xl px-5 py-20 sm:px-8 md:py-28">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-olive">Contact</p>
        <h1 className="mt-5 font-display text-5xl text-maroon md:text-6xl text-balance">
          Write to the atelier
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg text-ink-muted">
          Questions about a pair, a custom colour, shipping, or care — we read every note.
        </p>
        <p className="mt-4 font-body text-sm text-ink">hello@alankara.com</p>

        {sent ? (
          <p className="mt-16 font-script text-2xl italic text-warm-brown">
            Thank you — we will write back when the table is quiet.
          </p>
        ) : (
          <form
            className="mt-14 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              const name = String(data.get("name") ?? "").trim();
              const email = String(data.get("email") ?? "").trim();
              const message = String(data.get("message") ?? "").trim();
              window.location.href = `mailto:hello@alankara.com?subject=${encodeURIComponent(
                `Atelier note from ${name}`,
              )}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;
              setSent(true);
            }}
          >
            <label className="block">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-olive">Name</span>
              <Input required className="mt-2" name="name" />
            </label>
            <label className="block">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-olive">Email</span>
              <Input required type="email" className="mt-2" name="email" />
            </label>
            <label className="block">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-olive">Message</span>
              <Textarea required className="mt-2 min-h-36" name="message" />
            </label>
            <Button type="submit">Send</Button>
          </form>
        )}
      </div>
    </div>
  );
}
