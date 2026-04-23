import { createFileRoute } from "@tanstack/react-router";
import { FileText, Filter } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { LiveReportsFeed } from "@/components/eco/LiveReportsFeed";
import { StatCard } from "@/components/eco/StatCard";
import { aqiAvgSpark, firesSpark, reportsSpark } from "@/lib/mock-data";
import { Flame, Wind, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — EcoLens" },
      { name: "description", content: "Live citizen reports of environmental issues across Punjab." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <PageShell title="Reports" subtitle="Live citizen submissions" icon={FileText}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="grid grid-cols-3 gap-5">
            <StatCard label="Today" value="128" delta="↗ 12" data={reportsSpark} icon={FileText} tone="teal" />
            <StatCard label="Resolved" value="86%" delta="↗ 2.1%" data={aqiAvgSpark} icon={CheckCircle2} tone="blue" />
            <StatCard label="Open fires" value="312" delta="↗ 18" data={firesSpark} icon={Flame} tone="warn" />
          </div>
          <LiveReportsFeed />
        </div>
        <div className="space-y-5 lg:col-span-4">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Filters</p>
                <p className="mt-1 text-sm">Refine the feed</p>
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-2">
              {["Air pollution", "Water contamination", "Deforestation", "Waste dumping"].map((c) => (
                <label key={c} className="glossy flex cursor-pointer items-center justify-between rounded-2xl bg-white/[0.025] px-3 py-2.5 ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                  <span className="text-xs text-foreground">{c}</span>
                  <span className="h-3 w-3 rounded-full bg-gradient-to-br from-teal to-blueaccent" />
                </label>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Severity</p>
            <div className="mt-3 space-y-2 text-xs">
              {[
                ["High", "62", "bad"],
                ["Medium", "41", "warn"],
                ["Low", "25", "good"],
              ].map(([k, v, tone]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={`num text-${tone}`}>{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}