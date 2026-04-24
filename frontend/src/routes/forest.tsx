import { createFileRoute } from "@tanstack/react-router";
import { Trees } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { ProtectedRoute } from "@/components/eco/ProtectedRoute";

export const Route = createFileRoute("/forest")({
  head: () => ({ meta: [{ title: "Forest — EcoLens" }, { name: "description", content: "Forest cover and deforestation tracking across Punjab districts." }] }),
  component: () => (
    <ProtectedRoute>
      <ForestPage />
    </ProtectedRoute>
  ),
});

const districts = [
  { name: "Hoshiarpur", cover: 78, change: "+1.2%" },
  { name: "Ropar", cover: 64, change: "-0.4%" },
  { name: "Pathankot", cover: 71, change: "+0.8%" },
  { name: "Gurdaspur", cover: 52, change: "-1.1%" },
];

function ForestPage() {
  return (
    <PageShell title="Forest Cover" subtitle="District-level tracking" icon={Trees}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total green cover</p>
          <p className="num mt-3 text-6xl font-light">3.71% <span className="text-base text-muted-foreground">of state area</span></p>
          <div className="mt-5 space-y-2">
            {districts.map((d) => (
              <div key={d.name} className="glossy rounded-2xl bg-white/[0.025] p-3 ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                <div className="flex items-center justify-between">
                  <p className="text-sm">{d.name}</p>
                  <span className={`text-[10px] ${d.change.startsWith("+") ? "text-good" : "text-bad"}`}>{d.change}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-blueaccent transition-all duration-700"
                    style={{ width: `${d.cover}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tree planting drives</p>
          <p className="num mt-3 text-4xl font-light">12,408</p>
          <p className="text-xs text-muted-foreground">saplings planted this quarter</p>
          <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-teal to-blueaccent px-4 py-3 text-sm font-medium text-background transition active:scale-[0.99]">
            Join the next drive
          </button>
        </GlassCard>
      </div>
    </PageShell>
  );
}