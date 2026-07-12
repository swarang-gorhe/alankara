"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FabricTexture } from "@/components/ui/FabricTexture";
import { Input } from "@/components/ui/input";

export function ChapterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section
      className="relative overflow-hidden bg-maroon px-6 py-24 text-ivory md:py-28"
      aria-label="Join the Alankara Family"
    >
      <FabricTexture id="newsletter" className="opacity-[0.08]" opacity={1} />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="font-script text-2xl text-champagne/90">Stay in the loop</p>
        <h2 className="mt-4 font-display text-3xl md:text-4xl">
          New drops, studio notes, and slow-fashion stories
        </h2>
        <p className="mx-auto mt-4 max-w-md font-body text-sm text-ivory/80">
          One email a month — no spam, just thread counts and collection previews.
        </p>

        {submitted ? (
          <p className="mt-10 font-body text-champagne">
            Thank you — we&apos;ll be in touch when the next batch is ready.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-ivory/30 bg-ivory/10 text-ivory placeholder:text-ivory/50"
              aria-label="Email address"
            />
            <Button
              type="submit"
              variant="secondary"
              data-magnetic
              className="border-ivory/40 bg-ivory text-maroon hover:bg-cotton"
            >
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
