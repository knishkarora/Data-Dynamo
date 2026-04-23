import { GlassCard } from "./GlassCard";
import { ArrowUpRight, AlertTriangle } from "lucide-react";

export function UnusedBudgetCard() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Unused budget</p>
          <p className="mt-1 text-sm text-foreground/80">Q4 · idle allocation</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-warn/15 px-2 py-1 text-[10px] text-warn ring-1 ring-warn/30">
          <AlertTriangle className="h-3 w-3" /> Needs attention
        </span>
      </div>
      <p className="num mt-5 text-5xl font-light text-foreground">
        ₹534 <span className="text-2xl text-muted-foreground">Cr</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">43% of total allocation untapped</p>
      <button className="mt-4 inline-flex items-center gap-1 text-xs text-teal transition hover:gap-2">
        View 12 projects <ArrowUpRight className="h-3 w-3" />
      </button>
    </GlassCard>
  );
}