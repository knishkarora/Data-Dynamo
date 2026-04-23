import { GlassCard } from "./GlassCard";
import { ChevronDown, MapPin, ShieldCheck, Upload } from "lucide-react";

export function ReportIssueCard() {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Report an issue</p>
          <p className="mt-1 text-sm text-foreground/80">Help your community</p>
        </div>
      </div>

      <button className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] py-7 text-center transition hover:border-teal/40 hover:bg-white/[0.03]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-teal">
          <Upload className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <p className="text-sm text-foreground">Drop photo or video</p>
        <p className="text-[11px] text-muted-foreground">or browse · max 25MB</p>
      </button>

      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/[0.025] px-3 py-2.5 ring-1 ring-white/5">
        <MapPin className="h-3.5 w-3.5 text-teal" strokeWidth={1.8} />
        <input
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Auto-detect location"
          defaultValue="Ludhiana, Punjab"
        />
        <span className="rounded-full bg-good/15 px-2 py-0.5 text-[10px] text-good ring-1 ring-good/20">GPS</span>
      </div>

      <button className="mt-2 flex w-full items-center justify-between rounded-2xl bg-white/[0.025] px-3 py-2.5 text-xs text-foreground ring-1 ring-white/5">
        <span className="text-muted-foreground">Category</span>
        <span className="flex items-center gap-1">Air pollution <ChevronDown className="h-3 w-3" /></span>
      </button>

      <button className="mt-4 w-full rounded-2xl bg-gradient-to-r from-teal to-blueaccent px-4 py-3 text-sm font-medium text-background shadow-[0_10px_30px_-12px_var(--teal)] transition active:scale-[0.99]">
        Submit report
      </button>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3" /> Reports are public and anonymized
      </p>
    </GlassCard>
  );
}