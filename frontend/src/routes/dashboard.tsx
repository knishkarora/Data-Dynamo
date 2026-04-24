import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/eco/Sidebar";
import { TopBar } from "@/components/eco/TopBar";
import { AQIHero } from "@/components/eco/AQIHero";
import { MapCard } from "@/components/eco/MapCard";
import { BudgetCard } from "@/components/eco/BudgetCard";
import { ReportIssueCard } from "@/components/eco/ReportIssueCard";
import { UnusedBudgetCard } from "@/components/eco/UnusedBudgetCard";
import { StatCard } from "@/components/eco/StatCard";
import { LiveReportsFeed } from "@/components/eco/LiveReportsFeed";
import { AIChatPanel } from "@/components/eco/AIChatPanel";
import { aqiAvgSpark, firesSpark, reportsSpark } from "@/lib/mock-data";
import { Flame, FileText, Wind } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: Index,
});

const fetchAQI = async (lat: number, lng: number) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/aqi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  });
  if (!response.ok) throw new Error("Failed to fetch AQI");
  return response.json();
};

function Index() {
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 30.901, lng: 75.8573 }) // Default Ludhiana
    );
  }, []);

  const { data: aqiData } = useQuery({
    queryKey: ["aqi-stat", coords],
    queryFn: () => fetchAQI(coords!.lat, coords!.lng),
    enabled: !!coords,
    refetchInterval: 300000,
  });

  const currentAQI = aqiData?.indexes?.[0]?.aqi || 182;
  const aqiCategory = aqiData?.indexes?.[0]?.category || "Unhealthy";

  const { data: counts, dataUpdatedAt: countsUpdatedAt } = useQuery({
    queryKey: ["report-counts"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/counts`);
      if (!res.ok) throw new Error("Failed to fetch counts");
      return res.json();
    },
    refetchInterval: 30000
  });

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(800px 500px at 12% 10%, color-mix(in oklab, var(--teal) 8%, transparent), transparent 60%)," +
            "radial-gradient(700px 500px at 90% 90%, color-mix(in oklab, var(--blueaccent) 8%, transparent), transparent 60%)",
        }}
      />

      <Sidebar />

      <main className="mx-auto max-w-[1600px] px-6 pb-10 pl-[100px] pr-6 pt-6">
        <TopBar />

        <h1 className="sr-only">Climx environmental dashboard</h1>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left column */}
          <section className="space-y-5 lg:col-span-4">
            <AQIHero />
            <MapCard />
            <BudgetCard />
          </section>

          {/* Center column */}
          <section className="space-y-5 lg:col-span-4">
            <ReportIssueCard />
            <UnusedBudgetCard />
            <div className="grid grid-cols-2 gap-5">
              <StatCard 
                label="AQI Avg" 
                value={currentAQI.toString()} 
                delta={aqiCategory} 
                data={aqiAvgSpark} 
                icon={Wind} 
                tone="teal" 
              />
              <StatCard label="Resolved" value={`${counts?.resolvedPercent || 0}%`} delta="Global" data={reportsSpark} icon={FileText} tone="blue" />
            </div>
          </section>

          {/* Right column */}
          <section className="space-y-5 lg:col-span-4">
            <div className="grid grid-cols-2 gap-5">
              <StatCard label="Total Reports" value={counts?.total?.toString() || "0"} delta="All time" data={firesSpark} icon={Flame} tone="warn" />
              <StatCard label="Reports today" value={counts?.today?.toString() || "0"} delta="Live" data={reportsSpark} icon={FileText} tone="teal" />
            </div>
            <LiveReportsFeed />
            <AIChatPanel />
          </section>
        </div>

        <footer className="mt-10 flex items-center justify-between text-[11px] text-muted-foreground">
          <p>Climx · Environmental accountability for India</p>
          <p>Last Sync: {countsUpdatedAt ? new Date(countsUpdatedAt).toLocaleTimeString() : "Syncing..."}</p>
        </footer>
      </main>
    </div>
  );
}
