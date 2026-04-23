import { createFileRoute } from "@tanstack/react-router";
import { Map as MapIcon } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { MapCard } from "@/components/eco/MapCard";
import { GlassCard } from "@/components/eco/GlassCard";
import { mapMarkers } from "@/lib/mock-data";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map — EcoLens" },
      { name: "description", content: "Live environmental map of Punjab with AQI, fires, and reports." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <PageShell title="Environmental Map" subtitle="Punjab · live overlay" icon={MapIcon}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <MapCard />
        </div>
        <div className="space-y-5 lg:col-span-4">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Zones</p>
            <div className="mt-3 space-y-2">
              {mapMarkers.map((m) => {
                const tone = m.severity === "high" ? "bad" : m.severity === "med" ? "warn" : "good";
                return (
                  <div key={m.id} className="glossy flex items-center justify-between rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                    <div>
                      <p className="text-sm">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">AQI reading</p>
                    </div>
                    <span className={`num rounded-full bg-${tone}/15 px-2.5 py-1 text-xs text-${tone} ring-1 ring-${tone}/30`}>
                      {m.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}