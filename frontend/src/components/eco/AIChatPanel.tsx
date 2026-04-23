import { GlassCard } from "./GlassCard";
import { Send, Sparkles } from "lucide-react";

const suggestions = [
  "Why is AQI spiking in Ludhiana?",
  "Show stubble fire trends",
  "Compare budget vs spend",
];

export function AIChatPanel() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal/30 to-blueaccent/20 ring-1 ring-teal/30">
          <Sparkles className="h-4 w-4 text-teal" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-sm text-foreground">EcoLens AI</p>
          <p className="text-[10px] text-muted-foreground">Ask anything about your region</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/[0.025] p-3 text-xs text-foreground/85 ring-1 ring-white/5">
        Hi 👋 — air quality in Punjab is currently <span className="text-bad">unhealthy</span> due to elevated PM2.5. Want a breakdown by city?
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            className="rounded-full bg-white/[0.03] px-2.5 py-1 text-[10px] text-muted-foreground ring-1 ring-white/5 transition hover:bg-white/[0.07] hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="group mt-4 flex items-center gap-2 rounded-full bg-white/[0.025] px-3 py-2 ring-1 ring-white/5 transition focus-within:ring-teal/40 focus-within:shadow-[0_0_24px_-10px_var(--teal)]">
        <input
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Ask EcoLens…"
        />
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal to-blueaccent text-background">
          <Send className="h-3 w-3" />
        </button>
      </div>
    </GlassCard>
  );
}