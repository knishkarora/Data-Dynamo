import { motion } from "framer-motion";
import {
  Home, FileText, Users, Map as MapIcon, BarChart3, Droplet, Trees, UserCircle, Settings, Activity,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

const items = [
  { icon: Home, label: "Overview", to: "/" },
  { icon: FileText, label: "Reports", to: "/reports" },
  { icon: Activity, label: "Real-time Feed", to: "/feed" },
  { icon: Users, label: "Community", to: "/community" },
  { icon: MapIcon, label: "Map", to: "/map" },
  { icon: BarChart3, label: "Analytics", to: "/analytics" },
  { icon: Droplet, label: "Water", to: "/water" },
  { icon: Trees, label: "Forest", to: "/forest" },
  { icon: UserCircle, label: "Profile", to: "/profile" },
  { icon: Settings, label: "Settings", to: "/settings" },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="fixed left-4 top-1/2 z-40 -translate-y-1/2">
      <div className="glass-strong glossy flex w-[64px] flex-col items-center gap-1 rounded-full px-2 py-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
        <SignedIn>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full transition hover:brightness-110 overflow-hidden">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-10 w-10",
                  userButtonTrigger: "h-10 w-10"
                }
              }}
            />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-teal/80 text-[10px] font-semibold text-background ring-1 ring-white/20 transition hover:brightness-110">
              CX
            </button>
          </SignInButton>
        </SignedOut>
        <div className="my-1 h-px w-6 bg-white/5" />
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = pathname === it.to;
          return (
            <Link
              key={it.label}
              to={it.to}
              className="group relative flex h-11 w-11 items-center justify-center"
              aria-label={it.label}
            >
              {isActive && (
                <motion.span
                  layoutId="activePill"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal/25 to-blueaccent/15 ring-1 ring-teal/30 shadow-[0_0_20px_-6px_var(--teal)]"
                />
              )}
              <span className="absolute inset-1 rounded-2xl bg-white/[0.02] opacity-0 ring-1 ring-white/5 transition-all duration-200 group-hover:opacity-100" />
              <Icon
                className={cn(
                  "relative h-[18px] w-[18px] transition-all duration-200",
                  isActive
                    ? "text-teal"
                    : "text-muted-foreground group-hover:-translate-y-[1px] group-hover:text-foreground group-hover:scale-110",
                )}
                strokeWidth={1.6}
              />
              <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-card/90 px-2.5 py-1 text-xs text-foreground opacity-0 ring-1 ring-white/10 backdrop-blur transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                {it.label}
              </span>
            </Link>
          );
        })}
        <div className="my-1 h-px w-6 bg-white/5" />
      </div>
    </aside>
  );
}