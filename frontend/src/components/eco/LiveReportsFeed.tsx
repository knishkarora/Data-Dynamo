import { GlassCard } from "./GlassCard";
import { Heart, MapPin, Loader2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";

const sevTone: Record<string, string> = {
  high: "bg-bad/15 text-bad ring-bad/30",
  med: "bg-warn/15 text-warn ring-warn/30",
  low: "bg-good/15 text-good ring-good/30",
  pending: "bg-white/10 text-muted-foreground ring-white/20",
};

const fetchReports = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports?limit=5`);
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();
  return data.reports || [];
};

export function LiveReportsFeed() {
  const queryClient = useQueryClient();
  const { data: reports = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    refetchInterval: 5000, // Still keep polling as fallback
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    
    socket.on("connect", () => {
      console.log("Connected to Real-time Feed");
    });

    socket.on("new-report", (newReport) => {
      console.log("Real-time report received!", newReport);
      // Invalidate both feed and map queries
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports:geojson"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live reports</p>
          <p className="mt-1 text-sm text-foreground/80">Last updates</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="flex h-8 w-8 items-center justify-center rounded-full glass text-muted-foreground hover:text-teal hover:bg-white/5 transition active:scale-95"
            title="Manual Refresh"
          >
            <RotateCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} strokeWidth={2} />
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className={cn("absolute inline-flex h-full w-full rounded-full bg-teal opacity-70", !isFetching && "animate-ping")} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
            </span>
            {isFetching ? "Syncing" : "Live"}
          </div>
        </div>
      </div>

      {isLoading && reports.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      ) : (
        <ul className="space-y-2">
          {reports.map((r: any, i: number) => (
            <motion.li
              key={r._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              whileHover={{ y: -2 }}
              className="group flex items-center gap-3 rounded-2xl bg-white/[0.02] p-2.5 ring-1 ring-white/5 transition hover:bg-white/[0.05]"
            >
              <img
                src={r.image_url.startsWith('http') ? r.image_url : `${import.meta.env.VITE_API_URL}${r.image_url}`}
                alt=""
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:brightness-110"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{r.summary || r.category.replace('_', ' ')}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" /> Punjab region · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] ring-1 capitalize", sevTone[r.status] || sevTone['pending'])}>
                  {r.status}
                </span>
              </div>
            </motion.li>
          ))}
          {reports.length === 0 && (
            <p className="text-center py-8 text-xs text-muted-foreground">No reports found.</p>
          )}
        </ul>
      )}
    </GlassCard>
  );
}
