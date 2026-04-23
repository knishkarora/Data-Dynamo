import { createFileRoute } from "@tanstack/react-router";
import { UserCircle, MapPin, Award, FileText } from "lucide-react";
import { PageShell } from "@/components/eco/PageShell";
import { GlassCard } from "@/components/eco/GlassCard";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — EcoLens" }, { name: "description", content: "Your EcoLens contributor profile." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [stats, setStats] = useState({ 
    reports: (user?.publicMetadata?.reportsCount as number) || 0, 
    resolved: (user?.publicMetadata?.resolvedCount as number) || 0, 
    impact: (user?.publicMetadata?.impactScore as string) || "0%",
    badges: (user?.publicMetadata?.badges as string[]) || []
  });
  const [myReports, setMyReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        // Fetch stats (which also syncs metadata for future visits)
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch my reports
        const reportsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/my-reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setMyReports(reportsData);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    if (isLoaded && user) {
      fetchData();
    }
  }, [getToken, isLoaded, user]);

  if (!isLoaded) return null;

  return (
    <PageShell title="Profile" subtitle="Your contribution at a glance" icon={UserCircle}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-4 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img 
                src={user?.imageUrl || "https://i.pravatar.cc/120?img=12"} 
                alt={user?.fullName || "User"} 
                className="h-24 w-24 rounded-full ring-2 ring-teal/40 object-cover shadow-lg shadow-teal/20" 
              />
              <span className="absolute -bottom-1 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal to-blueaccent ring-2 ring-background">
                <Award className="h-3 w-3 text-background" />
              </span>
            </div>
            <p className="mt-3 text-lg font-medium">{user?.fullName || "Eco Contributor"}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {user?.publicMetadata?.location as string || "Location Not Set"}
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-teal font-semibold">
              {stats.reports >= 10 ? "Top contributor · Tier 2" : "Eco Explorer · Tier 1"}
            </p>
          </div>
        </GlassCard>

        <div className="space-y-5 lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { k: "Reports", v: stats.reports, i: FileText },
              { k: "Resolved", v: stats.resolved, i: Award },
              { k: "Impact", v: stats.impact, i: UserCircle },
            ].map(({ k, v, i: Icon }) => (
              <GlassCard key={k} className="p-5">
                <Icon className="h-4 w-4 text-teal" />
                <p className="num mt-3 text-3xl font-light tracking-tight">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-0 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">My Reports</p>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground">
                {myReports.length} Total
              </span>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {myReports.length > 0 ? (
                myReports.map((report) => (
                  <div key={report._id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition">
                    <div className="h-12 w-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                      <img src={`${import.meta.env.VITE_API_URL}${report.image_url}`} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{report.category.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground truncate">{report.description}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold ${
                      report.status === 'resolved' ? 'bg-teal/20 text-teal' : 'bg-amber/20 text-amber'
                    }`}>
                      {report.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-muted-foreground text-xs italic">
                  No reports submitted yet.
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Earned Badges</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.badges.length > 0 ? (
                stats.badges.map((b) => (
                  <div key={b} className="glossy flex flex-col items-center rounded-2xl bg-white/[0.025] p-3 text-center ring-1 ring-white/5 transition hover:bg-white/[0.05]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal/30 to-blueaccent/20 ring-1 ring-teal/30">
                      <Award className="h-4 w-4 text-teal" />
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">{b}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 text-center text-[10px] text-muted-foreground italic bg-white/5 rounded-xl">
                  Submit reports to earn environment protection badges!
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}