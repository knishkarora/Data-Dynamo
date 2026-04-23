

# EcoLens — Premium Environmental Dashboard

A calm, minimal, dark-mode SaaS dashboard matching the reference exactly. Built on the project's TanStack Start + React stack with Tailwind, shadcn/ui, Framer Motion, Lenis, Lucide, and Recharts.

## Design system

- **Palette (strict, 2 accents max):**
  - Background `#0B1220`, Cards `#0F172A` / `#111827`
  - Borders `rgba(255,255,255,0.05)`
  - Text primary `#E5E7EB`, secondary `#9CA3AF`
  - Accents: subtle teal `#2DD4BF` + soft blue `#3B82F6` (gradient, low intensity only)
  - Status pills: muted red / amber / green — desaturated, no neon
- **Style:** soft glassmorphism, 20–28px radii, generous padding, whisper-soft shadows, no heavy glow
- **Type:** Inter, tight tracking on big numbers, light weights for labels
- **Motion:** Framer Motion (hover lift -2px, fade/scale-in on mount), Lenis smooth scroll wrapper

## Layout

Single dashboard route at `/` with a fixed left rail and a 3-column responsive grid.

### 1. Left pill sidebar (fixed, vertical)
- Floating rounded-full glass container, slim width (~80px)
- Top: EcoLens logo mark
- Icons (Lucide): Home, FileText, Users, Map, BarChart3, Droplet, Trees, UserCircle, Settings
- Active item: rounded squircle with soft teal glow + tooltip label ("Overview") sliding in
- Hover: smooth background fade + slight scale (Framer Motion)
- Bottom: avatar circle

### 2. Top bar
- Pill search input ("Search location, reports, topics…") with ⌘K hint
- Right: notification bell (badge), date chip "May 25, 2025", theme toggle

### 3. Main grid (3 columns)

**Left column**
- **AQI Hero card** — "Air Quality Index · Punjab", huge "182" + "Unhealthy" label, PM2.5 / PM10 readings, soft Recharts area sparkline, "Updated 10 min ago", View Details button
- **Environmental Map card** — dark stylized map (SVG of Punjab with city dots + circular value bubbles 312/156/85/72), toggle pills (AQI / Fire Data / Reports), zoom controls, AQI scale legend
- **Budget Transparency card** — circular progress (57% Utilized), Allocated ₹1,247 Cr / Spent ₹713 Cr, Recharts monthly bar chart Jan–Dec

**Center column**
- **Report an Issue card** — dashed upload zone, auto-detect location field, category dropdown, gradient "Submit Report" CTA, public-visibility note
- **Unused Budget card** — ₹534 Cr highlight, "Needs Attention" tag, View Projects link

**Right column**
- **Stat cards row** (3 across): AQI Avg 182, Active Fires 312, Reports Today 128 — each with micro Recharts sparkline
- **Live Reports feed** — 5 items: rounded thumbnail, title, location, time + distance, severity pill (High/Medium/Low), like count; hover lifts + brightens
- **EcoLens AI Assistant** — bot avatar, greeting bubble, 3 suggested-question chips, glowing focus input

## Components (reusable)

`Sidebar`, `TopBar`, `GlassCard`, `StatCard`, `AQIHero`, `ReportIssueCard`, `MapCard`, `BudgetCard`, `UnusedBudgetCard`, `LiveReportItem`, `LiveReportsFeed`, `AIChatPanel`, `LenisProvider`

## Technical setup

- Replace `src/routes/index.tsx` placeholder with the dashboard
- Update `src/styles.css` with the EcoLens dark palette (oklch tokens) — applied as default
- Add Inter font, Lenis smooth-scroll provider in `__root.tsx`
- Install: `framer-motion`, `lenis`, `recharts` (lucide-react, clsx, tailwind-merge already present)
- All data mocked in `src/lib/mock-data.ts`
- Fully responsive: 3-col → 2-col → 1-col stack on smaller breakpoints

## Out of scope (frontend-only)
No auth, no real map tiles (custom SVG), no backend, no live data, no functional chat — all UI shells with mock content.

