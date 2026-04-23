import { GlassCard } from "./GlassCard";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { aqiSparkline } from "@/lib/mock-data";
import { ArrowUpRight, Wind, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const fetchAQI = async (lat: number, lng: number) => {
  console.log('Fetching AQI for:', { lat, lng });
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/aqi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  });
  if (!response.ok) throw new Error("Failed to fetch AQI");
  return response.json();
};

export function AQIHero() {
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos.coords.latitude && pos.coords.longitude) {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      },
      () => setCoords({ lat: 30.901, lng: 75.8573 }) // Default Ludhiana
    );
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["aqi", coords],
    queryFn: () => fetchAQI(coords!.lat, coords!.lng),
    enabled: !!coords && !!coords.lat && !!coords.lng,
    refetchInterval: 300000, // Update every 5 minutes
  });

  const aqiInfo = data?.indexes?.[0];
  const aqiValue = aqiInfo?.aqi || 182;
  const aqiCategory = aqiInfo?.category || "Unhealthy";
  const dominantPollutant = aqiInfo?.dominantPollutant?.toUpperCase() || "PM2.5";

  // Map category to color
  const getCategoryStyles = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("good") || c.includes("low")) return "bg-good/15 text-good ring-good/30";
    if (c.includes("moderate")) return "bg-warn/15 text-warn ring-warn/30";
    return "bg-bad/15 text-bad ring-bad/30";
  };

  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Air Quality Index
          </p>
          <p className="mt-1 text-sm text-foreground/80">
            {isLoading ? "Fetching location..." : "Punjab · Live"}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-teal">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wind className="h-4 w-4" strokeWidth={1.6} />}
        </div>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <span className={cn("num text-7xl font-light leading-none text-foreground transition-all", isLoading && "opacity-50")}>
          {isLoading ? "---" : aqiValue}
        </span>
        {!isLoading && (
          <span className={cn("mb-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-all", getCategoryStyles(aqiCategory))}>
            {aqiCategory}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.025] px-4 py-3 ring-1 ring-white/5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Dominant</p>
          <p className="num mt-1 text-lg text-foreground">{isLoading ? "..." : dominantPollutant}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.025] px-4 py-3 ring-1 ring-white/5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Region</p>
          <p className="num mt-1 text-lg text-foreground truncate">{data?.regionCode?.toUpperCase() || "IN"}</p>
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
        <span className="text-muted-foreground">
          {data ? `Synced: ${new Date().toLocaleTimeString()}` : "Syncing live..."}
        </span>
        <Link 
          to="/analytics"
          className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1.5 text-foreground ring-1 ring-white/5 transition hover:bg-white/[0.07]"
        >
          View details <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </GlassCard>
  );
}