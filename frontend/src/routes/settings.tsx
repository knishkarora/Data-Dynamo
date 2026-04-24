import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/eco/ProtectedRoute";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — EcoLens" }, { name: "description", content: "EcoLens preferences and notifications." }] }),
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 rounded-full ring-1 transition",
        on ? "bg-gradient-to-r from-teal to-blueaccent ring-teal/40" : "bg-white/[0.04] ring-white/10",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          on ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function SettingsPage() {
  const [prefs, setPrefs] = useState({
    push: true,
    daily: true,
    weekly: false,
    location: true,
    public: false,
  });
  return (
    <PageShell title="Settings" subtitle="Preferences & notifications" icon={SettingsIcon}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notifications</p>
          <div className="mt-4 divide-y divide-white/5">
            {[
              ["push", "Push alerts", "Critical AQI and fire alerts"],
              ["daily", "Daily digest", "Morning summary at 8:00"],
              ["weekly", "Weekly impact report", "Sundays · your stats"],
            ].map(([k, t, d]) => (
              <div key={k} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">{t}</p>
                  <p className="text-[11px] text-muted-foreground">{d}</p>
                </div>
                <Toggle on={(prefs as any)[k]} onChange={(v) => setPrefs({ ...prefs, [k]: v })} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Privacy</p>
          <div className="mt-4 divide-y divide-white/5">
            {[
              ["location", "Use precise location", "GPS tagged on reports"],
              ["public", "Public profile", "Show name on leaderboard"],
            ].map(([k, t, d]) => (
              <div key={k} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">{t}</p>
                  <p className="text-[11px] text-muted-foreground">{d}</p>
                </div>
                <Toggle on={(prefs as any)[k]} onChange={(v) => setPrefs({ ...prefs, [k]: v })} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}