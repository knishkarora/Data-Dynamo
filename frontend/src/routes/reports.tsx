import { createFileRoute } from "@tanstack/react-router";
import { FileText, Filter } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { LiveReportsFeed } from "@/components/eco/LiveReportsFeed";
import { StatCard } from "@/components/eco/StatCard";
import { aqiAvgSpark, firesSpark, reportsSpark } from "@/lib/mock-data";
import { Flame, Wind, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Climx" },
      { name: "description", content: "Live citizen reports of environmental issues across India." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: counts } = useQuery({
    queryKey: ["report-counts"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/counts`);
      if (!res.ok) throw new Error("Failed to fetch counts");
      return res.json();
    },
    refetchInterval: 30000 // Refresh counts every 30 seconds
  });

  const severityData = [
    { k: "High", v: counts?.severity?.high || 0, tone: "bad" },
    { k: "Medium", v: counts?.severity?.medium || 0, tone: "warn" },
    { k: "Low", v: counts?.severity?.low || 0, tone: "good" },
  ];

  const categories = [
    { id: "stubble_burning", label: "Stubble Burning" },
    { id: "garbage_burning", label: "Garbage Burning" },
    { id: "industrial_pollution", label: "Industrial Pollution" },
    { id: "water_pollution", label: "Water Pollution" },
    { id: "illegal_dumping", label: "Waste Dumping" },
  ];

  return (
    <PageShell title="Reports" subtitle="Live citizen submissions" icon={FileText}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="grid grid-cols-3 gap-5">
            <StatCard label="Today" value={counts?.today?.toString() || "0"} delta="Live" data={reportsSpark} icon={FileText} tone="teal" />
            <StatCard label="Resolved" value={`${counts?.resolvedPercent || 0}%`} delta="Total" data={aqiAvgSpark} icon={CheckCircle2} tone="blue" />
            <StatCard label="Total Reports" value={counts?.total?.toString() || "0"} delta="All time" data={firesSpark} icon={Flame} tone="warn" />
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
              {categories.map((c) => (
                <label key={c.id} className="glossy flex cursor-pointer items-center justify-between rounded-2xl bg-white/[0.025] px-3 py-2.5 ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                  <span className="text-xs text-foreground">{c.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{counts?.categories?.[c.id] || 0}</span>
                    <span className="h-3 w-3 rounded-full bg-gradient-to-br from-teal to-blueaccent" />
                  </span>
                </label>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Severity</p>
            <div className="mt-3 space-y-2 text-xs">
              {severityData.map(({ k, v, tone }) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={`num text-${tone} font-semibold`}>{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}