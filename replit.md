# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `artifacts/quoc-sach-driver` — Quốc Sách Driver

Tourism booking site (private driver service) for Da Nang, Hue, and Hoi An. React + Vite + wouter, served at `/`.

- Pages: home, destinations (filterable grid), map (Google Maps), tour-builder (3-step wizard with live price estimate), booking (form), booking-confirmation, contact (Zalo/KakaoTalk/Gmail/Facebook), admin (recharts + status filters).
- i18n: EN/VI/KO via `src/i18n/LanguageContext.tsx` and `src/lib/localize.ts`.
- Itinerary state: zustand store at `src/lib/itinerary.ts`.
- Map markers use `<AdvancedMarker>` with custom HTML (no Pin component — avoids Google Cloud mapId requirement).
- Image assets live in `public/destinations/`; resolve URLs through `withBase()`.
- Types/enums (`Location`, `City`, `LocationCategory`, etc.) come from `@workspace/api-client-react` — do not import `@workspace/api-zod` directly (not in artifact deps).
- Required secret: `VITE_GOOGLE_MAPS_API_KEY`.
- Seed data lives in `scripts/src/seed.ts` (12 destinations, 5 reviews).
