import { GlassCard } from "./GlassCard";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { aqiSparkline } from "@/lib/mock-data";
import { ArrowUpRight, Wind } from "lucide-react";

export function AQIHero() {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Air Quality Index
          </p>
          <p className="mt-1 text-sm text-foreground/80">Punjab · Live</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-teal">
          <Wind className="h-4 w-4" strokeWidth={1.6} />
        </div>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <span className="num text-7xl font-light leading-none text-foreground">182</span>
        <span className="mb-2 inline-flex items-center rounded-full bg-bad/15 px-2.5 py-1 text-xs font-medium text-bad ring-1 ring-bad/30">
          Unhealthy
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.025] px-4 py-3 ring-1 ring-white/5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">PM2.5</p>
          <p className="num mt-1 text-lg text-foreground">94 <span className="text-xs text-muted-foreground">µg/m³</span></p>
        </div>
        <div className="rounded-2xl bg-white/[0.025] px-4 py-3 ring-1 ring-white/5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">PM10</p>
          <p className="num mt-1 text-lg text-foreground">156 <span className="text-xs text-muted-foreground">µg/m³</span></p>
        </div>
      </div>

      <div className="mt-4 h-20 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={aqiSparkline} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiHero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--teal)"
              strokeWidth={1.6}
              fill="url(#aqiHero)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Updated 10 min ago</span>
        <button className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1.5 text-foreground ring-1 ring-white/5 transition hover:bg-white/[0.07]">
          View details <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </GlassCard>
  );
}