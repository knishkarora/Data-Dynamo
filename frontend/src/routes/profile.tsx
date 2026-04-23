import { createFileRoute } from "@tanstack/react-router";
import { UserCircle, MapPin, Award, FileText } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — EcoLens" }, { name: "description", content: "Your EcoLens contributor profile." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <PageShell title="Profile" subtitle="Your contribution at a glance" icon={UserCircle}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-4">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img src="https://i.pravatar.cc/120?img=12" alt="" className="h-24 w-24 rounded-full ring-2 ring-teal/40" />
              <span className="absolute -bottom-1 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal to-blueaccent ring-2 ring-background">
                <Award className="h-3 w-3 text-background" />
              </span>
            </div>
            <p className="mt-3 text-lg">Aarav Sharma</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Ludhiana, Punjab
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-teal">Top contributor · Tier 2</p>
          </div>
        </GlassCard>

        <div className="space-y-5 lg:col-span-8">
          <div className="grid grid-cols-3 gap-5">
            {[
              { k: "Reports", v: "142", i: FileText },
              { k: "Resolved", v: "118", i: Award },
              { k: "Impact", v: "94%", i: UserCircle },
            ].map(({ k, v, i: Icon }) => (
              <GlassCard key={k} className="p-5">
                <Icon className="h-4 w-4 text-teal" />
                <p className="num mt-3 text-3xl font-light">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
              </GlassCard>
            ))}
          </div>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent badges</p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {["Air Watcher", "River Guard", "Tree Hero", "Whistleblower"].map((b) => (
                <div key={b} className="glossy flex flex-col items-center rounded-2xl bg-white/[0.025] p-3 text-center ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal/30 to-blueaccent/20 ring-1 ring-teal/30">
                    <Award className="h-4 w-4 text-teal" />
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}