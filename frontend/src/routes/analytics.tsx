import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { Area, AreaChart, ResponsiveContainer, Bar, BarChart, XAxis, Tooltip, Line, LineChart } from "recharts";
import { aqiSparkline, budgetMonthly, firesSpark } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const fetchAQI = async (lat: number, lng: number) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/aqi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  });
  if (!response.ok) throw new Error("Failed to fetch AQI");
  return response.json();
};

const fetchAQIHistory = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/aqi/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
};

const fetchWaterStats = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/water/stats`);
  if (!response.ok) throw new Error("Failed to fetch water stats");
  return response.json();
};

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — EcoLens" },
      { name: "description", content: "Historical trends across air, fires, and reports." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <AnalyticsPage />
    </ProtectedRoute>
  ),
});

function AnalyticsPage() {
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 30.901, lng: 75.8573 })
    );
  }, []);

  const { data: aqiData, dataUpdatedAt } = useQuery({
    queryKey: ["aqi", coords],
    queryFn: () => fetchAQI(coords!.lat, coords!.lng),
    enabled: !!coords,
    refetchInterval: 60000, // Sync every minute
  });

  const { data: historyData } = useQuery({
    queryKey: ["aqi-history"],
    queryFn: fetchAQIHistory,
    refetchInterval: 60000,
  });

  const { data: waterStats } = useQuery({
    queryKey: ["water-stats"],
    queryFn: fetchWaterStats,
  });

  const [selectedState, setSelectedState] = useState<string>("");
  const stateData = waterStats?.data?.find((s: any) => s.name === selectedState);

  const liveAQI = aqiData?.indexes?.[0]?.aqi || "---";
  const category = aqiData?.indexes?.[0]?.category || "Syncing...";

  const chartData = historyData?.map((d: any) => ({
    v: d.aqiValue,
    m: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })) || aqiSparkline;

  return (
    <PageShell title="Analytics" subtitle="Trends · Live Historical Feed" icon={BarChart3}>
      {/* Live Status Header */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="py-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Live AQI</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-teal">{liveAQI}</span>
            <span className="text-xs text-muted-foreground">{category}</span>
          </div>
        </GlassCard>
        <GlassCard className="py-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Station Region</p>
          <p className="mt-1 text-sm font-medium">{aqiData?.regionCode?.toUpperCase() || "..."} (India)</p>
        </GlassCard>
        <GlassCard className="py-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Sync</p>
          <p className="mt-1 text-sm font-medium">
            {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Pending..."}
          </p>
        </GlassCard>
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-8">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AQI Trends · Live Database</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="aqiBig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" hide />
                <Tooltip 
                  contentStyle={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <Area type="monotone" dataKey="v" stroke="var(--teal)" strokeWidth={1.8} fill="url(#aqiBig)" animationDuration={1000} />
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Groundwater Monitoring</p>
              <p className="text-[10px] text-muted-foreground mt-1">Source: {waterStats?.source || "CGWB"} · {waterStats?.lastUpdated || "2023-24"}</p>
            </div>
            
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal transition-all min-w-[200px]"
            >
              <option value="">Select State/UT</option>
              {waterStats?.data?.map((s: any) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {!selectedState ? (
            <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
              <p className="text-xs text-muted-foreground italic">Please select a state to view groundwater analysis</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Extraction Stage</p>
                <p className={cn(
                  "text-xl font-bold",
                  (stateData?.metrics?.extractionStage || 0) > 100 ? "text-bad" : 
                  (stateData?.metrics?.extractionStage || 0) > 70 ? "text-warn" : "text-good"
                )}>
                  {stateData?.metrics?.extractionStage?.toFixed(1)}%
                </p>
                <p className="text-[9px] text-muted-foreground mt-1">
                  {(stateData?.metrics?.extractionStage || 0) > 100 ? "CRITICAL DEPLETION" : "SAFE LEVELS"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Total Availability</p>
                <p className="text-xl font-bold text-white">{stateData?.metrics?.totalAvailability?.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground mt-1">ham (Hectare Metre)</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Future Availability</p>
                <p className="text-xl font-bold text-teal">{stateData?.metrics?.futureAvailability?.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground mt-1">Projected ham</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Assessment Status</p>
                <p className={cn(
                  "text-lg font-bold tracking-tight uppercase",
                  stateData?.metrics?.status === "over_exploited" ? "text-bad" : 
                  stateData?.metrics?.status === "semi_critical" ? "text-warn" : "text-good"
                )}>
                  {stateData?.metrics?.status?.replace('_', ' ') || "PENDING"}
                </p>
                <p className="text-[9px] text-muted-foreground mt-1">CGWB Classification</p>
              </div>
            </div>
          )}
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