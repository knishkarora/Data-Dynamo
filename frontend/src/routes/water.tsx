import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Waves } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ProtectedRoute } from "@/components/eco/ProtectedRoute";

export const Route = createFileRoute("/water")({
  head: () => ({ meta: [{ title: "Water — EcoLens" }, { name: "description", content: "Water quality monitoring across rivers and reservoirs." }] }),
  component: () => (
    <ProtectedRoute>
      <WaterPage />
    </ProtectedRoute>
  ),
});

const sources = [
  { name: "Sutlej", ph: 7.2, do: 6.4, status: "Fair" },
  { name: "Beas", ph: 7.6, do: 7.1, status: "Good" },
  { name: "Ravi", ph: 6.8, do: 5.2, status: "Poor" },
  { name: "Ghaggar", ph: 7.0, do: 5.8, status: "Fair" },
];
const trend = Array.from({ length: 12 }, (_, i) => ({ v: 60 + Math.sin(i / 2) * 12 + i * 1.2 }));

function WaterPage() {
  return (
    <PageShell title="Water Quality" subtitle="Rivers · reservoirs · live" icon={Droplet}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Average index</p>
              <p className="num mt-2 text-6xl font-light">72</p>
              <p className="text-xs text-muted-foreground">Fair · slowly improving</p>
            </div>
            <Waves className="h-5 w-5 text-teal" />
          </div>
          <div className="mt-4 h-40 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--blueaccent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--blueaccent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="var(--blueaccent)" strokeWidth={1.8} fill="url(#waterGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sources</p>
          <div className="mt-3 space-y-2">
            {sources.map((s) => (
              <div key={s.name} className="glossy rounded-2xl bg-white/[0.025] p-3 ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                <div className="flex items-center justify-between">
                  <p className="text-sm">{s.name}</p>
                  <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-white/5">{s.status}</span>
                </div>
                <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                  <span>pH <span className="num text-foreground">{s.ph}</span></span>
                  <span>DO <span className="num text-foreground">{s.do}</span></span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}