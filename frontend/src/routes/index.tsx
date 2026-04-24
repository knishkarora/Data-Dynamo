import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { LoadingScreen } from "@/components/eco/LoadingScreen";
import { InteractiveMesh } from "@/components/eco/InteractiveMesh";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
function LandingPage() {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <>
      {showLoader && <LoadingScreen onComplete={() => setShowLoader(false)} />}
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-foreground selection:bg-teal/30">
      {/* Interactive Canvas Mesh */}
      <InteractiveMesh />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full opacity-15 blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(45, 212, 191, 0.6) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full opacity-15 blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(96, 165, 250, 0.6) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-[40%] left-[50%] -translate-x-1/2 h-[30%] w-[30%] rounded-full opacity-10 blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)' }}
        />
      </div>

      <nav className="relative z-50 fixed top-0 flex w-full items-center justify-between px-8 py-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Climx" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-6">
          <Link to="/feed" className="text-sm font-medium text-muted-foreground transition hover:text-teal">
            Live Feed
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition hover:text-teal">
            Dashboard
          </Link>
          <SignedIn>
            <Link 
              to="/dashboard" 
              className="glass-strong rounded-full px-5 py-2 text-sm font-bold text-foreground transition hover:scale-105 active:scale-95"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-full bg-teal px-6 py-2 text-sm font-black text-background transition-all hover:scale-105 hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                Login
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="mb-6"
          >
            <img src="/logo.png" alt="Climx Logo" className="h-48 w-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]" />
          </motion.div>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl text-balance">
            Environmental <span className="bg-gradient-to-br from-teal to-blueaccent bg-clip-text text-transparent">Accountability</span> for India
          </h1>
          
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            A premium dashboard for real-time air quality monitoring, fire detection, and budget transparency. Empowering citizens through data.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <SignInButton mode="modal">
              <button className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-foreground px-8 py-4 text-sm font-black text-background transition-all hover:scale-105 active:scale-95">
                <span className="relative z-10">Get Started Now</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-teal to-blueaccent transition-transform duration-500 group-hover:translate-x-0" />
              </button>
            </SignInButton>
            <Link 
              to="/dashboard" 
              className="glass-strong glossy flex items-center gap-2 rounded-2xl border border-white/5 px-8 py-4 text-sm font-bold transition-all hover:bg-white/5 hover:scale-105 active:scale-95"
            >
              Explore Data
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3"
        >
          <FeatureCard 
            icon={Zap}
            title="Real-time Insights"
            description="Up-to-the-minute air quality indices and thermal anomaly detection across the subcontinent."
          />
          <FeatureCard 
            icon={Shield}
            title="Accountability"
            description="Tracking unused budgets and government promises with citizen-led reporting tools."
          />
          <FeatureCard 
            icon={Globe}
            title="Community Driven"
            description="Join thousands of volunteers reporting environmental issues and driving local change."
          />
        </motion.div>
      </main>

      <footer className="relative z-10 mt-40 border-t border-white/5 bg-black/20 px-8 py-12 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Climx" className="h-5 w-auto grayscale opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">© 2026 Climx Labs</span>
          </div>
          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <a href="#" className="hover:text-teal transition-colors">Privacy</a>
            <a href="#" className="hover:text-teal transition-colors">Terms</a>
            <a href="#" className="hover:text-teal transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="glass-strong glossy group relative overflow-hidden rounded-3xl p-8 border border-white/5 transition-all duration-500 hover:-translate-y-2 hover:border-teal/30 hover:shadow-[0_20px_40px_-20px_rgba(45,212,191,0.2)]">
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal ring-1 ring-teal/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-teal group-hover:text-background">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="relative z-10 mt-6 text-xl font-bold">{title}</h3>
      <p className="relative z-10 mt-4 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
        {description}
      </p>
      <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
