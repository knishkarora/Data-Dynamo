import { GlassCard } from "./GlassCard";
import { liveReports, type Severity } from "@/lib/mock-data";
import { Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const sevTone: Record<Severity, string> = {
  High: "bg-bad/15 text-bad ring-bad/30",
  Medium: "bg-warn/15 text-warn ring-warn/30",
  Low: "bg-good/15 text-good ring-good/30",
};

export function LiveReportsFeed() {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live reports</p>
          <p className="mt-1 text-sm text-foreground/80">Last 24 hours</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
          </span>
          Live
        </span>
      </div>

      <ul className="space-y-2">
        {liveReports.map((r, i) => (
          <motion.li
            key={r.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            whileHover={{ y: -2 }}
            className="group flex items-center gap-3 rounded-2xl bg-white/[0.02] p-2.5 ring-1 ring-white/5 transition hover:bg-white/[0.05]"
          >
            <img
              src={r.thumb}
              alt=""
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:brightness-110"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{r.title}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" /> {r.location} · {r.time}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] ring-1", sevTone[r.severity])}>
                {r.severity}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Heart className="h-2.5 w-2.5" /> {r.likes}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </GlassCard>
  );
}