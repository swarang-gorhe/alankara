"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import {
  BRAND_EMAIL,
  BRAND_INSTAGRAM_HANDLE,
  BRAND_INSTAGRAM_URL,
  BRAND_PHONE_DISPLAY,
  BRAND_PHONE_TEL,
} from "@/lib/brand/contact";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <div className="relative overflow-hidden bg-ivory">
      <GrainOverlay />
      <div className="relative mx-auto max-w-3xl px-5 py-20 sm:px-8 md:py-28">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-olive">Contact</p>
        <h1 className="mt-5 font-display text-5xl text-maroon text-balance md:text-6xl">
          Write to the atelier
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg text-ink-muted">
          Questions about a pair, a custom colour, shipping, or care — we read every note.
        </p>

        <ul className="mt-8 space-y-3 font-body text-sm text-ink">
          <li>
            <span className="text-olive">Phone / WhatsApp · </span>
            <a href={BRAND_PHONE_TEL} className="text-maroon underline-offset-4 hover:underline">
              {BRAND_PHONE_DISPLAY}
            </a>
          </li>
          <li>
            <span className="text-olive">Email · </span>
            <a
              href={`mailto:${BRAND_EMAIL}`}
              className="text-maroon underline-offset-4 hover:underline"
            >
              {BRAND_EMAIL}
            </a>
          </li>
          <li>
            <span className="text-olive">Instagram · </span>
            <a
              href={BRAND_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-maroon underline-offset-4 hover:underline"
            >
              {BRAND_INSTAGRAM_HANDLE}
            </a>
          </li>
        </ul>

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
              window.location.href = `mailto:${BRAND_EMAIL}?subject=${encodeURIComponent(
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
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit">Send</Button>
              <Link
                href={BRAND_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-maroon underline-offset-4 hover:underline"
              >
                Visit Instagram →
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
