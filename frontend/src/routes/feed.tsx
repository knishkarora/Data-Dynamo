import { createFileRoute } from "@tanstack/react-router";
import { Activity, Flame, Users, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { RedditFeed } from "@/components/eco/RedditFeed";
import { GlassCard } from "@/components/eco/GlassCard";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Real-time Feed — Climx" },
      { name: "description", content: "Global real-time environmental issue stream." },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  return (
    <PageShell title="Community Feed" subtitle="Participate in local environmental discussions" icon={Activity}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1200px] mx-auto">
        <div className="lg:col-span-8">
          <div className="mb-6">
            <GlassCard className="flex items-center justify-between py-3 px-6 border-teal/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                <span className="text-xs font-medium text-teal uppercase tracking-widest">Network Active</span>
              </div>
              <div className="flex gap-4">
                <button className="text-[10px] uppercase font-bold text-teal flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Hot
                </button>
                <button className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Top
                </button>
              </div>
            </GlassCard>
          </div>
          
          <RedditFeed />
        </div>

        <div className="lg:col-span-4 space-y-6 hidden lg:block">
          <GlassCard className="p-6">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-teal" />
              Community Guidelines
            </h4>
            <ul className="text-xs space-y-3 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-teal font-bold">1.</span>
                Keep it anonymous. We value your safety and privacy.
              </li>
              <li className="flex gap-2">
                <span className="text-teal font-bold">2.</span>
                Be accurate. Community upvotes verify the severity of issues.
              </li>
              <li className="flex gap-2">
                <span className="text-teal font-bold">3.</span>
                Respect officials. Constructive criticism helps solve issues faster.
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-teal/10 to-transparent">
            <h4 className="text-sm font-bold mb-2">Impact Score</h4>
            <p className="text-xs text-muted-foreground mb-4">Every upvote helps prioritize critical environmental issues for local authorities.</p>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-teal w-2/3 shadow-[0_0_10px_var(--teal)]" />
            </div>
            <p className="text-[10px] mt-2 text-right text-teal font-bold">2.4k Upvotes Today</p>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
