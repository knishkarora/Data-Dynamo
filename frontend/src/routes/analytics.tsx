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