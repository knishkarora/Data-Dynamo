import { Bell, Calendar, Command, Search, Sun } from "lucide-react";


export function TopBar() {
  return (
    <header className="mb-6 flex items-center gap-4">
      <div className="glass flex h-11 flex-1 items-center gap-3 rounded-full px-4">
        <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
        <input
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Search location, reports, topics…"
        />
        <kbd className="hidden items-center gap-1 rounded-md border border-white/5 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
          <Command className="h-3 w-3" /> K
        </kbd>
      </div>
      <button className="glass flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground">
        <span className="relative">
          <Bell className="h-4 w-4" strokeWidth={1.6} />
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-teal" />
        </span>
      </button>
      <div className="glass hidden h-11 items-center gap-2 rounded-full px-4 text-xs text-muted-foreground md:flex">
        <Calendar className="h-3.5 w-3.5" strokeWidth={1.6} /> May 25, 2025
      </div>
      
      <div className="flex items-center gap-3">
        <button className="glass flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground">
          <Sun className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}