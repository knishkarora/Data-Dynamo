import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { Area, AreaChart, ResponsiveContainer, Bar, BarChart, XAxis, Tooltip, Line, LineChart } from "recharts";
import { aqiSparkline, budgetMonthly, firesSpark } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — EcoLens" },
      { name: "description", content: "Historical trends across air, fires, and reports." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <PageShell title="Analytics" subtitle="Trends · 12 month window" icon={BarChart3}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-8">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AQI · last 12 readings</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aqiSparkline}>
                <defs>
                  <linearGradient id="aqiBig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }} />
                <Area type="monotone" dataKey="v" stroke="var(--teal)" strokeWidth={1.8} fill="url(#aqiBig)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active fires</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={firesSpark}>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }} />
                <Line type="monotone" dataKey="v" stroke="var(--warn)" strokeWidth={2} dot={{ r: 3, fill: "var(--warn)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-12">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Budget utilization · monthly</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetMonthly}>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="url(#barBig)" />
                <defs>
                  <linearGradient id="barBig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--blueaccent)" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}