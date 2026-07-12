import { Sparkles } from "lucide-react";
import type { AIInsightsFixture } from "@/lib/fixtures/types";

type AIInsightsPanelProps = {
  insights: AIInsightsFixture;
};

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  return (
    <section
      className="relative overflow-hidden rounded-sm border border-gold/30 bg-gradient-to-br from-olive-linen/60 via-cream-light to-cream p-8 md:p-10"
      aria-label="AI review insights"
    >
      <div className="absolute right-6 top-6 opacity-20" aria-hidden="true">
        <Sparkles className="h-12 w-12 text-gold" />
      </div>

      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-sm border border-gold/40 bg-cream/80 px-2 py-0.5 font-body text-[10px] uppercase tracking-widest text-charcoal-muted">
            AI insights
          </span>
          <span className="text-xs text-charcoal-muted">
            {insights.status === "live" ? "Live from Alankara reviews" : "Seed data — run AI re-index for live themes"}
          </span>
        </div>

        <h2 className="font-display text-2xl text-maroon md:text-3xl">
          What our customers are saying
        </h2>
        <p className="mt-4 max-w-2xl text-charcoal-muted">{insights.summary}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-gold">
              Praise themes
            </h3>
            <ul className="mt-3 space-y-2">
              {insights.positiveThemes.map((theme) => (
                <li key={theme} className="text-sm text-charcoal">
                  {theme}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-gold">
              Areas to watch
            </h3>
            <ul className="mt-3 space-y-2">
              {insights.concerns.map((concern) => (
                <li key={concern} className="text-sm text-charcoal-muted">
                  {concern}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-gold">
              Trending praise
            </h3>
            <ul className="mt-3 space-y-2">
              {insights.trendingPraise.map((item) => (
                <li key={item} className="text-sm text-charcoal">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
