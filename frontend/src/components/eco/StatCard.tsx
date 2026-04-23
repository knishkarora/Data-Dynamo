import { GlassCard } from "./GlassCard";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  delta?: string;
  data: { v: number }[];
  icon: LucideIcon;
  tone?: "teal" | "blue" | "warn";
};

const toneMap = {
  teal: { stroke: "var(--teal)", id: "stTeal" },
  blue: { stroke: "var(--blueaccent)", id: "stBlue" },
  warn: { stroke: "var(--warn)", id: "stWarn" },
};

export function StatCard({ label, value, delta, data, icon: Icon, tone = "teal" }: Props) {
  const t = toneMap[tone];
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <p className="num mt-2 text-2xl font-light text-foreground">{value}</p>
      {delta && (
        <p className={cn("text-[11px]", tone === "warn" ? "text-warn" : "text-good")}>{delta}</p>
      )}
      <div className="mt-2 h-10 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={t.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={t.stroke} strokeWidth={1.4} fill={`url(#${t.id})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}