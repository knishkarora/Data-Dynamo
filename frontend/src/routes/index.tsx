import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/eco/Sidebar";
import { TopBar } from "@/components/eco/TopBar";
import { AQIHero } from "@/components/eco/AQIHero";
import { MapCard } from "@/components/eco/MapCard";
import { BudgetCard } from "@/components/eco/BudgetCard";
import { ReportIssueCard } from "@/components/eco/ReportIssueCard";
import { UnusedBudgetCard } from "@/components/eco/UnusedBudgetCard";
import { StatCard } from "@/components/eco/StatCard";
import { LiveReportsFeed } from "@/components/eco/LiveReportsFeed";
import { AIChatPanel } from "@/components/eco/AIChatPanel";
import { aqiAvgSpark, firesSpark, reportsSpark } from "@/lib/mock-data";
import { Flame, FileText, Wind } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(800px 500px at 12% 10%, color-mix(in oklab, var(--teal) 8%, transparent), transparent 60%)," +
            "radial-gradient(700px 500px at 90% 90%, color-mix(in oklab, var(--blueaccent) 8%, transparent), transparent 60%)",
        }}
      />

      <Sidebar />

      <main className="mx-auto max-w-[1600px] px-6 pb-10 pl-[100px] pr-6 pt-6">
        <TopBar />

        <h1 className="sr-only">EcoLens environmental dashboard</h1>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left column */}
          <section className="space-y-5 lg:col-span-4">
            <AQIHero />
            <MapCard />
            <BudgetCard />
          </section>

          {/* Center column */}
          <section className="space-y-5 lg:col-span-4">
            <ReportIssueCard />
            <UnusedBudgetCard />
            <div className="grid grid-cols-2 gap-5">
              <StatCard label="AQI Avg" value="182" delta="↘ 4 today" data={aqiAvgSpark} icon={Wind} tone="teal" />
              <StatCard label="Resolved" value="86%" delta="↗ 2.1%" data={reportsSpark} icon={FileText} tone="blue" />
            </div>
          </section>

          {/* Right column */}
          <section className="space-y-5 lg:col-span-4">
            <div className="grid grid-cols-2 gap-5">
              <StatCard label="Active fires" value="312" delta="↗ 18 today" data={firesSpark} icon={Flame} tone="warn" />
              <StatCard label="Reports today" value="128" delta="↗ 12" data={reportsSpark} icon={FileText} tone="teal" />
            </div>
            <LiveReportsFeed />
            <AIChatPanel />
          </section>
        </div>

        <footer className="mt-10 flex items-center justify-between text-[11px] text-muted-foreground">
          <p>EcoLens · Environmental accountability for Punjab</p>
          <p>Synced just now</p>
        </footer>
      </main>
    </div>
  );
}
