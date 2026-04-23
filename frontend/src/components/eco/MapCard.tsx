import { GlassCard } from "./GlassCard";
import { mapMarkers } from "@/lib/mock-data";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["AQI", "Fire Data", "Reports"] as const;

export function MapCard() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("AQI");

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Environmental map</p>
          <p className="mt-1 text-sm text-foreground/80">Punjab region · 4 zones</p>
        </div>
        <div className="glass flex rounded-full p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] transition",
                tab === t ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[260px] overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.2_0.03_260)] to-[oklch(0.16_0.02_255)] ring-1 ring-white/5">
        {/* Stylised map shapes */}
        <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <path
            d="M10,28 Q22,18 34,24 T58,32 Q72,36 80,52 T70,82 Q56,90 38,84 T14,68 Q6,52 10,28 Z"
            fill="rgba(45,212,191,0.04)"
            stroke="rgba(45,212,191,0.25)"
            strokeWidth="0.4"
          />
        </svg>

        {/* Markers */}
        {mapMarkers.map((m) => {
          const color = m.severity === "high" ? "var(--bad)" : m.severity === "med" ? "var(--warn)" : "var(--good)";
          return (
            <div
              key={m.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <div
                className="absolute inset-0 -m-3 animate-ping rounded-full opacity-30"
                style={{ background: color }}
              />
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-medium text-foreground ring-2"
                style={{
                  background: `color-mix(in oklab, ${color} 18%, transparent)`,
                  borderColor: color,
                  boxShadow: `0 0 18px -4px ${color}`,
                }}
              >
                {m.value}
              </div>
              <p className="mt-1 text-center text-[10px] text-muted-foreground">{m.name}</p>
            </div>
          );
        })}

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col rounded-xl bg-black/30 ring-1 ring-white/10 backdrop-blur">
          <button className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="h-px bg-white/10" />
          <button className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground">
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* AQI legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-[10px] text-muted-foreground ring-1 ring-white/10 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-good" /> Good
          <span className="ml-2 h-2 w-2 rounded-full bg-warn" /> Mod
          <span className="ml-2 h-2 w-2 rounded-full bg-bad" /> Unhealthy
        </div>
      </div>
    </GlassCard>
  );
}