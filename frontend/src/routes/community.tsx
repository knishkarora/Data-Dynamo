import { createFileRoute } from "@tanstack/react-router";
import { Users, Award, MessageCircle, Heart } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { motion } from "framer-motion";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — EcoLens" },
      { name: "description", content: "Top contributors and active citizens reporting environmental issues." },
    ],
  }),
  component: CommunityPage,
});

const leaders = [
  { name: "Aarav Sharma", city: "Ludhiana", reports: 142, avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Priya Kaur", city: "Amritsar", reports: 128, avatar: "https://i.pravatar.cc/80?img=32" },
  { name: "Rohan Singh", city: "Jalandhar", reports: 96, avatar: "https://i.pravatar.cc/80?img=15" },
  { name: "Meera Gill", city: "Patiala", reports: 81, avatar: "https://i.pravatar.cc/80?img=49" },
  { name: "Karan Bedi", city: "Mohali", reports: 74, avatar: "https://i.pravatar.cc/80?img=22" },
  { name: "Sana Malik", city: "Bathinda", reports: 62, avatar: "https://i.pravatar.cc/80?img=44" },
];

function CommunityPage() {
  return (
    <PageShell title="Community" subtitle="Citizens powering accountability" icon={Users}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <div className="grid grid-cols-3 gap-5">
            {[
              { k: "Members", v: "12,482", i: Users },
              { k: "Posts", v: "3,217", i: MessageCircle },
              { k: "Likes", v: "98,604", i: Heart },
            ].map(({ k, v, i: Icon }) => (
              <GlassCard key={k} className="p-5">
                <Icon className="h-4 w-4 text-teal" />
                <p className="num mt-3 text-3xl font-light">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top contributors</p>
              <Award className="h-4 w-4 text-teal" />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {leaders.map((l, idx) => (
                <motion.div
                  key={l.name}
                  whileHover={{ y: -2 }}
                  className="glossy flex items-center gap-3 rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5 transition hover:bg-white/[0.05]"
                >
                  <div className="relative">
                    <img src={l.avatar} alt="" className="h-10 w-10 rounded-full ring-1 ring-white/10" />
                    {idx < 3 && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-teal to-blueaccent text-[8px] font-semibold text-background ring-2 ring-background">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{l.name}</p>
                    <p className="text-[10px] text-muted-foreground">{l.city}</p>
                  </div>
                  <span className="num text-xs text-teal">{l.reports}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Discussion</p>
            <div className="mt-3 space-y-2">
              {["AQI alert in Mandi Gobindgarh", "Why budgets stay unspent", "How to file an industrial complaint"].map((t) => (
                <button key={t} className="glossy flex w-full items-start gap-2 rounded-2xl bg-white/[0.025] p-3 text-left ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                  <MessageCircle className="mt-0.5 h-3.5 w-3.5 text-teal" />
                  <span className="text-xs">{t}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}