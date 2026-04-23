import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

export function PageShell({ title, subtitle, icon: Icon, children }: Props) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex items-center gap-4"
        >
          <div className="glass glossy flex h-12 w-12 items-center justify-center rounded-2xl text-teal ring-1 ring-teal/20">
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <div>
            <h1 className="text-2xl font-light tracking-tight text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </motion.div>
        {children}
      </main>
    </div>
  );
}