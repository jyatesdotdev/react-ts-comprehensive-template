# AGENTS.md — src

_The app bootstrap, routing shell, global styles, and test setup live here; this file guides agents editing files directly in `src/` (not the subdirectories, which have their own AGENTS.md)._

## Purpose
This directory is the frontend entrypoint. `main.tsx` mounts React into the DOM; `App.tsx` is the routing shell that wires static pages plus every POC from the registry into `react-router-dom`; `index.css` pulls in Tailwind globally; `setupTests.ts` primes Vitest. Subdirectories (`pages/`, `components/`, `config/`, `assets/`) hold the actual screens, chrome, POC registry, and static assets.

## Files
- `main.tsx` — Vite entry. `createRoot(document.getElementById('root')!)` renders `<App/>` inside `<StrictMode>`; imports `./index.css`. The `!` non-null assertion assumes `#root` from `index.html`.
- `App.tsx` — routing shell. Renders `<Navbar/>` then `<Routes>` inside `<Suspense fallback={<Loading/>}>`. Static routes: `/` → `Home`, `/tutorials` → `Tutorials`. Then `POC_CONFIG.map(poc => <Route key={poc.id} path={poc.path} element={<poc.component/>}/>)` — POC routes are data-driven from `config/pocs.ts`. `Loading` is a local Tailwind-styled spinner. `export default App`.
- `App.test.tsx` — Vitest unit test for `App` (colocated). Asserts the navbar logo link (`/RESEARCH LAB/i`), the home page default copy, and tech links (`React 19`, `Vite 8`) render. Uses `@testing-library/react` + `describe/it/expect` from `vitest`.
- `index.css` — global stylesheet, a single `@import "tailwindcss";` (Tailwind CSS 4 entry). Imported once by `main.tsx`.
- `App.css` — ORPHANED legacy Vite-starter CSS (`.counter`, `.hero`, `#next-steps`, `.ticks`, CSS custom props like `var(--accent)`). Currently imported by NOTHING — safe to ignore; do not assume its classes are live.
- `setupTests.ts` — Vitest global setup: `import '@testing-library/jest-dom'`. Wired via `setupFiles` in `vitest.config.ts`; gives tests matchers like `toBeInTheDocument()`.

## Conventions & best practices
- TS is STRICT (`tsconfig.app.json`): `noUnusedLocals/Parameters`, `verbatimModuleSyntax` (use `import type` for type-only imports), `erasableSyntaxOnly` (no enums/namespaces/param-properties — use `type`/`interface`/`as const`), `jsx: react-jsx` (do NOT `import React` just for JSX; import only hooks/APIs you use, e.g. `Suspense`).
- React 19 + StrictMode: effects/renders run twice in dev — make effects idempotent and cleanup-safe.
- Styling is HYBRID: layout/spacing via Tailwind utility classes (as in the `Loading` spinner). POC/page components apply Tailwind through styled-components using `styled.tag.attrs({ className: "..." })\`\`` and use `$`-prefixed TRANSIENT props (`$active`, `$type`) for dynamic styles so they aren't forwarded to the DOM. Match that idiom in new components.
- Keep `App.tsx` DECLARATIVE and registry-driven: add screens by editing the registry, not by hand-listing `<Route>`s (except the two static ones).
- Tests: Vitest with globals + jsdom; colocate as `*.test.tsx` next to the unit. Assert via roles/text like the existing test rather than test IDs.

## Business rules & cross-file awareness
- `App.tsx` consumes `src/config/pocs.ts` (`POC_CONFIG`, the SINGLE SOURCE OF TRUTH for POCs). The same array feeds `src/components/Navbar.tsx` (Experiments dropdown, grouped by category) and `src/components/POCLayout.tsx` (experiment switcher). Add one entry there and it appears in routing, navbar, and switcher automatically — do NOT add routes here directly for a POC.
- POC components are LAZY (`React.lazy` in `config/pocs.ts`) and MUST keep `export default`; `App` renders them under `<Suspense>`. A missing default export breaks the lazy import at runtime.
- Frontend fetches RELATIVE paths (`/api/...`, `/ws`); Vite (port 5180, strictPort) proxies these to the Hono backend on `:3001`. Never hardcode `http://localhost:3001` in components here.
- The `config/` directory (`src/config/**`, currently just `pocs.ts`) is EXCLUDED from coverage (`vitest.config.ts`); other `src/**` is gated at 80% lines/functions/branches/statements. New non-trivial logic here needs tests or it can drop coverage below the CI gate.
- The scaffolder (`scripts/create-poc`) edits `config/pocs.ts` and `server/routes.ts` by matching anchor strings — do NOT reformat those files' anchor lines. (This dir's `App.tsx` is generic and not touched by the scaffolder.)

## When you add or change files here
Typical change = adjusting the shell or global setup (POCs are added in `config/pocs.ts`, not here):
1. Adding a NON-POC top-level page (e.g. another `Tutorials`-like screen): create it under `src/pages/`, import it in `App.tsx`, add one static `<Route>` inside `<Routes>`.
2. If it should be lazy, `import { lazy } from 'react'` and define `const X = lazy(() => import('./pages/X'))` (App.tsx has no `import React` — use named `lazy` per `verbatimModuleSyntax`; `config/pocs.ts` can write `React.lazy` only because it `import React from 'react'`), then rely on the existing `<Suspense>`; ensure `X` has an `export default`.
3. Global CSS/Tailwind tweaks go in `index.css` (or Tailwind config) — not `App.css`.
4. New test setup (extra matchers, MSW, mocks) goes in `setupTests.ts` so all Vitest suites see it.
5. Update/adjust `App.test.tsx` if you change the shell's rendered structure; run `npm test`.

## Gotchas
- `App.css` is dead code — editing it changes nothing on screen. Global styles are Tailwind via `index.css`.
- Only `import type` for type-only symbols, and remove unused imports/vars — `verbatimModuleSyntax` + `noUnusedLocals` fail the build otherwise.
- Do NOT add a POC `<Route>` by hand here; register it in `config/pocs.ts` so navbar + switcher stay in sync.
- `main.tsx`'s `getElementById('root')!` depends on `index.html` having `<div id="root">`; don't rename that id.
- StrictMode double-invokes effects in dev — a component that leaks (e.g. Three.js) will show it here first; dispose resources in effect cleanup.

## Related
- Parent / repo root: [../AGENTS.md](../AGENTS.md)
- POC registry (source of truth): [./config/pocs.ts](./config/pocs.ts)
- Shell chrome consuming the registry: [./components/Navbar.tsx](./components/Navbar.tsx), [./components/POCLayout.tsx](./components/POCLayout.tsx)
- Backend API router (proxy target): [../server/routes.ts](../server/routes.ts)
