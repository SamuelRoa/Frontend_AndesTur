# AGENTS.md — AndesTur Panel

## Stack
- **Vite 8 + React 19 + Tailwind CSS 4 + shadcn/ui** (new-york style)
- **All JSX/JS** (no TypeScript — ignore `components.json` claiming `tsx:true`)
- **pnpm** (has pnpm-lock.yaml; avoid npm)

## Commands
| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server on **http://localhost:5174** (not default 5173) |
| `pnpm build` | Vite production build |
| `pnpm preview` | Preview production build |

No lint, format, typecheck, or test commands exist (no ESLint, Prettier, Jest, Vitest, husky, or CI).

## Path alias
`@/` → project root (`./`), **not** `src/`.
```js
// e.g.
import App from '@/src/App'
import { cn } from '@/lib/utils'
```

## Architecture
- **Entrypoint**: `src/main.jsx` → wraps App with `BrowserRouter`, `ThemeProvider`, `AuthProvider`
- **Routing**: State-based module switching in `src/App.jsx` (a `switch` on `activeModule`). `react-router-dom` is installed but its `Routes`/`Route` are **not used** in this pattern.
- **Auth**: JWT stored in `localStorage` keys `auth_token` / `auth_user`. See `lib/auth.jsx` (context) and `lib/api.js` (fetch wrapper with `Bearer` header).
- **API base**: `VITE_API_URL` from `.env.local` defaults to `http://localhost:3000`. All endpoints under `/api/...`.
- **Backend**: Separate repo `Backend_AndesTur-master` — Express 5 + Sequelize + PostgreSQL (Supabase). Not in this workspace.

## Project structure
- `src/` — only `App.jsx` and `main.jsx`
- `components/` — app components at top level, `modules/` for CRUD modules, `ui/` for shadcn primitives
- `lib/` — `api.js` (HTTP client), `auth.jsx` (auth context), `utils.js` (`cn` helper), `mock-data.js` (sample data for dev)
- `hooks/` — `use-mobile.js`, `use-toast.js`
- `styles/globals.css` — Tailwind CSS 4 with `@import 'tailwindcss'` + custom OKLCH theme variables (no `tailwind.config.js`)

## Key conventions
- **shadcn/ui components** use `@/components/ui/...` and `@/lib/utils` alias, but **all in JSX** (rename `.tsx` imports to actual `.jsx` files if adding shadcn components)
- **CSS**: Tailwind CSS 4 via `@tailwindcss/postcss` plugin; no legacy `tailwind.config.js`
- **Module props**: Each `*Module` component receives no props — they call `lib/api.js` directly
- **Demo creds**: `admin@andetur.com` / `admin123`
- **Style**: Infer from existing files — no formatter config exists

## What's missing (not an oversight)
- No tests, no lint, no typecheck, no CI, no pre-commit hooks
