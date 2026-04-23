import { GlassCard } from "./GlassCard";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { budgetMonthly } from "@/lib/mock-data";

export function BudgetCard() {
  const pct = 57;
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Budget transparency</p>
          <p className="mt-1 text-sm text-foreground/80">FY 2024–25 · Punjab</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-[110px] w-[110px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
            <circle
              cx="50" cy="50" r={r}
              stroke="url(#budgetGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${dash} ${c}`}
            />
            <defs>
              <linearGradient id="budgetGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--teal)" />
                <stop offset="100%" stopColor="var(--blueaccent)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-2xl font-light text-foreground">{pct}%</span>
            <span className="text-[10px] text-muted-foreground">Utilized</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Allocated</span>
            <span className="num text-foreground">₹1,247 Cr</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Spent</span>
            <span className="num text-foreground">₹713 Cr</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className="num text-foreground">₹534 Cr</span>
          </div>
        </div>
      </div>

      <div className="mt-5 h-24 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={budgetMonthly} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="var(--blueaccent)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}