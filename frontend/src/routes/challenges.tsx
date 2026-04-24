import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Trees, Droplet, Wind, Users, Flame, Target, Calendar, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/eco/ProtectedRoute";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Community Challenges — Climx" },
      { name: "description", content: "Join community-driven environmental challenges and make a real impact in your neighborhood." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <ChallengesPage />
    </ProtectedRoute>
  ),
});

const challengeImages = [
  "/image.png",
  "/image copy.png",
  "/image copy 2.png",
  "/image copy 3.png",
];

function ImageSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % challengeImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl ring-1 ring-white/10 mb-6">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={challengeImages[index]}
          initial={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      
      {/* Overlay gradient for text legibility if needed, but here it's just for aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {challengeImages.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? "bg-teal w-6" : "bg-white/30 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const featuredChallenge = {
  title: "Plant 100 Trees in Sector 32 This Month",
  description: "Join your neighbors in transforming Sector 32 into a green corridor. Every sapling counts toward cleaner air and a cooler community.",
  icon: Trees,
  progress: 67,
  goal: 100,
  daysLeft: 8,
  participants: 43,
  category: "Plantation",
};

const challenges = [
  {
    title: "Zero Waste Week — Mohali",
    description: "Commit to zero single-use plastics for 7 days. Log your daily progress.",
    icon: Droplet,
    progress: 82,
    goal: 200,
    daysLeft: 3,
    participants: 112,
    category: "Waste",
    status: "active" as const,
  },
  {
    title: "AQI Monitor Squad",
    description: "Report air quality readings from 50 locations across Ludhiana this week.",
    icon: Wind,
    progress: 34,
    goal: 50,
    daysLeft: 5,
    participants: 28,
    category: "Air Quality",
    status: "active" as const,
  },
  {
    title: "Canal Cleanup Drive — Sidhwan",
    description: "Organize and participate in cleaning the Sidhwan Canal stretch near GT Road.",
    icon: Droplet,
    progress: 15,
    goal: 80,
    daysLeft: 14,
    participants: 15,
    category: "Water",
    status: "upcoming" as const,
  },
  {
    title: "Cycle-to-Work Challenge",
    description: "Switch your daily commute to cycling for 30 days. Track your carbon savings.",
    icon: Wind,
    progress: 120,
    goal: 120,
    daysLeft: 0,
    participants: 89,
    category: "Transport",
    status: "completed" as const,
  },
];

const topContributors = [
  { name: "Harpreet Kaur", trees: 12, avatar: "https://i.pravatar.cc/80?img=5" },
  { name: "Rajesh Verma", trees: 9, avatar: "https://i.pravatar.cc/80?img=11" },
  { name: "Simran Gill", trees: 8, avatar: "https://i.pravatar.cc/80?img=32" },
  { name: "Amandeep Singh", trees: 7, avatar: "https://i.pravatar.cc/80?img=14" },
  { name: "Pooja Mehta", trees: 6, avatar: "https://i.pravatar.cc/80?img=44" },
];

function ChallengesPage() {
  const [joined, setJoined] = useState(false);

  return (
    <PageShell title="Community Challenges" subtitle="Collective action for a greener tomorrow" icon={Trophy}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Main Column */}
        <div className="space-y-5 lg:col-span-8">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { k: "Active Challenges", v: "6", i: Target },
              { k: "Participants", v: "287", i: Users },
              { k: "Completed", v: "14", i: CheckCircle2 },
            ].map(({ k, v, i: Icon }) => (
              <GlassCard key={k} className="p-5">
                <Icon className="h-4 w-4 text-teal" />
                <p className="num mt-3 text-3xl font-light">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
              </GlassCard>
            ))}
          </div>

          {/* Featured Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="relative overflow-hidden border border-teal/20 p-0">
              <div className="relative p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal ring-1 ring-teal/25">
                    <Flame className="h-3 w-3" /> Featured Challenge
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground ring-1 ring-white/10">
                    <Calendar className="h-3 w-3" /> {featuredChallenge.daysLeft} days left
                  </span>
                </div>

                <ImageSlider />

                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal/20 to-blueaccent/10 ring-1 ring-teal/20">
                    <Trees className="h-7 w-7 text-teal" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold leading-tight">{featuredChallenge.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{featuredChallenge.description}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="num font-medium text-teal">{featuredChallenge.progress} / {featuredChallenge.goal} trees</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(featuredChallenge.progress / featuredChallenge.goal) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-teal to-blueaccent"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {topContributors.slice(0, 4).map((c) => (
                        <img
                          key={c.name}
                          src={c.avatar}
                          alt=""
                          className="h-7 w-7 rounded-full ring-2 ring-background"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">+{featuredChallenge.participants} joined</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setJoined(!joined)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                      joined
                        ? "bg-teal/15 text-teal ring-1 ring-teal/30"
                        : "bg-gradient-to-r from-teal to-blueaccent text-background shadow-lg shadow-teal/20"
                    }`}
                  >
                    {joined ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Joined
                      </>
                    ) : (
                      <>
                        Join Challenge <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Other Challenges Grid */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">All Challenges</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {challenges.map((ch, idx) => {
                const Icon = ch.icon;
                const pct = Math.min((ch.progress / ch.goal) * 100, 100);
                return (
                  <motion.div
                    key={ch.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                  >
                    <GlassCard className="group cursor-pointer p-5 transition-all duration-200 hover:ring-teal/20">
                      <div className="mb-3 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-1 ${
                          ch.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                            : ch.status === "upcoming"
                              ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                              : "bg-teal/10 text-teal ring-teal/20"
                        }`}>
                          {ch.status === "completed" ? (
                            <CheckCircle2 className="h-2.5 w-2.5" />
                          ) : ch.status === "upcoming" ? (
                            <Clock className="h-2.5 w-2.5" />
                          ) : (
                            <Target className="h-2.5 w-2.5" />
                          )}
                          {ch.status}
                        </span>
                        <Icon className="h-4 w-4 text-muted-foreground transition group-hover:text-teal" />
                      </div>
                      <h3 className="text-sm font-medium leading-snug">{ch.title}</h3>
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{ch.description}</p>

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{ch.participants} participants</span>
                          <span className="num text-teal">{Math.round(pct)}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              ch.status === "completed"
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                : "bg-gradient-to-r from-teal to-blueaccent"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {ch.daysLeft > 0 && (
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          <Clock className="mr-0.5 inline h-3 w-3" /> {ch.daysLeft} days remaining
                        </p>
                      )}
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5 lg:col-span-4">
          {/* Leaderboard */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Challenge Leaderboard</p>
              <Trophy className="h-4 w-4 text-teal" />
            </div>
            <div className="space-y-2">
              {topContributors.map((c, idx) => (
                <motion.div
                  key={c.name}
                  whileHover={{ x: 2 }}
                  className="glossy flex items-center gap-3 rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5 transition hover:bg-white/[0.05]"
                >
                  <div className="relative">
                    <img src={c.avatar} alt="" className="h-9 w-9 rounded-full ring-1 ring-white/10" />
                    {idx < 3 && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-teal to-blueaccent text-[8px] font-semibold text-background ring-2 ring-background">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.trees} trees planted</p>
                  </div>
                  <Trees className="h-3.5 w-3.5 text-teal/50" />
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Impact Summary */}
          <GlassCard>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Collective Impact</p>
            <div className="space-y-3">
              {[
                { label: "Trees Planted", value: "1,247", icon: Trees },
                { label: "Kg Waste Collected", value: "3,890", icon: Droplet },
                { label: "AQI Reports Filed", value: "684", icon: Wind },
                { label: "Active Volunteers", value: "287", icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5 ring-1 ring-white/5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-teal/60" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <span className="num text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* How it works */}
          <GlassCard>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">How It Works</p>
            <div className="space-y-2.5">
              {[
                "Browse active challenges in your area",
                "Join a challenge and track your contributions",
                "Earn badges and climb the leaderboard",
                "Create your own challenge for the community",
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/10 text-[10px] font-semibold text-teal ring-1 ring-teal/20">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
