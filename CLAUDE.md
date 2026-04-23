# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EcoLens is an environmental accountability dashboard for Punjab, built with TanStack Start + React. It visualizes AQI, fire data, citizen reports, and budget transparency in a dark-themed, glassmorphism UI.

## Stack

- **Framework**: TanStack Start (TanStack Router + Vite)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (Radix UI), Framer Motion, Lucide icons
- **Charts**: Recharts
- **Smooth scroll**: Lenis
- **Forms**: React Hook Form + Zod
- **Package manager**: Bun

## Common Commands

```bash
# Frontend (all commands run from /frontend directory)
cd frontend

# Development
bun run dev

# Build
bun run build

# Lint
bun run lint

# Format
bun run format

# Preview production build
bun run preview
```

## Architecture

### Routes
File-based routing in `src/routes/`. The route tree is auto-generated into `routeTree.gen.ts` by TanStack Router plugin. Main routes:
- `/` — Dashboard (index.tsx)
- `/map`, `/analytics`, `/reports`, `/community`, `/forest`, `/water`, `/profile`, `/settings`

### Components
- `src/components/eco/` — Custom EcoLens components (Sidebar, TopBar, AQIHero, MapCard, BudgetCard, etc.)
- `src/components/ui/` — shadcn/ui component library (do not modify, regenerate via CLI)

### Routing
- `src/router.tsx` — Creates the router with `getRouter()`, includes `DefaultErrorComponent` for error handling
- `src/routeTree.gen.ts` — Auto-generated from file routes, do not edit manually

### Styles
- `src/styles.css` — Global CSS with Tailwind + EcoLens dark palette (oklch tokens)
- Design tokens: Background `#0B1220`, Cards `#0F172A`, accent teal `#2DD4BF`, blue `#3B82F6`

### Mock Data
- `src/lib/mock-data.ts` — All dashboard data (AQIHero sparklines, stat cards, live reports feed)

### Key files
- `frontend/vite.config.ts` — Vite config with `@tailwindcss/vite` and `@tanstack/router-plugin`
- `frontend/tsconfig.json` — Path aliases: `@/*` → `src/*`