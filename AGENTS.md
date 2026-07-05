# react-ts-template — Research Lab

A "Research Lab" template for rapidly building isolated Proof-of-Concept (POC) experiments on a React 19 + TypeScript frontend with a Hono backend.

> **This file is the master index.** It orients you and routes you to the right place. **Every major directory has its own `AGENTS.md`** with the local rules that matter there — read the directory-level file before editing files in that directory. See the [Directory index](#directory-index) below.

## Architecture

The **POC model** is the heart of the repo. Each experiment is a self-contained page (and optionally a backend module) registered in one central place.

- **Frontend** runs on **Vite port 5180** (`strictPort`). **Backend** Hono runs on **port 3001**.
- The Vite dev server **proxies `/api` and `/ws`** to `http://localhost:3001` (see `vite.config.ts`). Frontend code therefore fetches **relative paths** like `/api/pocs/<id>` — **never hardcode `http://localhost:3001`** in components. (The one intentional exception: `POCLayout` builds an absolute `http://localhost:3001/api/pocs/<id>` URL for its external "Backend API" link button.)
- **`src/config/pocs.ts` is the single source of truth.** It defines the `POCMetadata` interface and the `POC_CONFIG` array. Each entry: `{ id, name, path, component (React.lazy), badge?, badgeType?: WIP|POC|STABLE|Template, description, category?: Graphics|Network|State|Utility|General }`.
- Adding one `POC_CONFIG` entry automatically wires up **routing** (`src/App.tsx` maps entries to `<Route>` inside `<Suspense>`), the **navbar** (`src/components/Navbar.tsx` groups by category into the Experiments dropdown), and the **experiment switcher** (`src/components/POCLayout.tsx`).
- **Backend:** `server/index.ts` is the entry (health check `/health`, mounts `server/routes.ts` under `/api`, a global `/ws` echo WebSocket, and serves `dist/` static + SPA fallback in prod). `server/routes.ts` mounts each `server/pocs/<id>.ts` module via `api.route("/pocs/<id>", module)`. Each module exports a `new Hono()` with routes relative to its mount point.

## Tech stack

| Area | Library | Major version |
| --- | --- | --- |
| UI framework | react / react-dom | 19 |
| Language | typescript | ~6.0 |
| Build / dev server | vite | 8 |
| Styling | tailwindcss (`@tailwindcss/vite`) | 4 |
| Styling | styled-components | 6 |
| Routing | react-router-dom | 7 |
| 3D / WebGL | three | 0.183 |
| Backend | hono | 4 |
| Backend runtime | @hono/node-server / @hono/node-ws | 1 |
| Unit tests | vitest / @vitest/coverage-v8 | 4 |
| E2E / visual | @playwright/test | 1.59 |
| Dev runner | tsx, npm-run-all | — |

Package manager: **npm** (`package-lock.json`).

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs client + server together (`run-p dev:client dev:server`). |
| `npm run dev:client` | Vite dev server only (port 5180). |
| `npm run dev:server` | Hono backend only (`tsx watch server/index.ts`, port 3001). |
| `npm run build` | Type-check + production build (`tsc -b && vite build`). |
| `npm run lint` | ESLint across the repo (`eslint .`). |
| `npm test` | Run Vitest unit tests once (`vitest run`). |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run test:e2e` | Playwright E2E suite (auto-starts `npm run dev`). |
| `npm run test:screenshots` | Playwright visual/screenshot spec (`e2e/screenshots.spec.ts`). |
| `npm run create-poc "<Name>" [type] [--backend]` | Scaffold a new POC (types: basic, webgl, websocket, webrtc, api, todo). |
| `npm run preview` | Serve the built frontend (`vite preview`). |
| `npm start` | Run the production server (`node --import tsx server/index.ts`). |

## Directory index

Each directory below owns its local conventions — **open the linked `AGENTS.md` before working in that directory.**

| Directory | Purpose |
| --- | --- |
| [`src/`](./src/AGENTS.md) | Frontend entrypoint: React bootstrap (`main.tsx`), registry-driven routing shell (`App.tsx`), global Tailwind CSS, Vitest setup. |
| [`src/config/`](./src/config/AGENTS.md) | POC registry (`pocs.ts`): `POCMetadata` interface + `POC_CONFIG`, single source of truth for routing/nav; coverage-excluded. |
| [`src/components/`](./src/components/AGENTS.md) | Shared UI (`Navbar`, `POCLayout`) using the styled-components + Tailwind idiom; `POCLayout` is the standard POC page wrapper. |
| [`src/pages/`](./src/pages/AGENTS.md) | Top-level (non-POC) route pages `Home` and `Tutorials` plus their Vitest unit tests; `Home` consumes `POC_CONFIG`. |
| [`src/pages/pocs/`](./src/pages/pocs/AGENTS.md) | Lazy-loaded POC experiment pages wrapping `POCLayout`; must be registered in `src/config/pocs.ts`. Includes copyable templates. |
| [`server/`](./server/AGENTS.md) | Hono backend: `index.ts` entry (health, `/ws` echo, `/api` mount, static/SPA) and `routes.ts` `/api` router mounting `server/pocs/*`. |
| [`server/pocs/`](./server/pocs/AGENTS.md) | Per-experiment Hono API modules with in-memory state, each mounted under `/api/pocs/<id>` via `server/routes.ts`. |
| [`scripts/`](./scripts/AGENTS.md) | `create-poc` code generator that scaffolds POCs and string-edits `pocs.ts` + `routes.ts` via anchor matching. |
| [`scripts/templates/`](./scripts/templates/AGENTS.md) | POC template sources with placeholder tokens, ESLint-ignored, copied + substituted by `create-poc`; `frontend/` + `backend/`. |
| [`scripts/templates/frontend/`](./scripts/templates/frontend/AGENTS.md) | React component stencils (one per POC type) consumed by the `create-poc` scaffolder via placeholder tokens. |
| [`scripts/templates/backend/`](./scripts/templates/backend/AGENTS.md) | Hono backend module templates (basic + todo CRUD) with `__NAME__`/`__ID__` tokens the `create-poc` scaffolder fills in. |
| [`e2e/`](./e2e/AGENTS.md) | Playwright E2E + full-page screenshot specs; baseURL 5180, auto-starts `npm run dev`. `POC_PATHS` in `screenshots.spec.ts` is a **manually maintained** hardcoded list, not derived from `POC_CONFIG`, so it can drift — keep it in sync by hand when adding POCs. |
| [`docs/`](./docs/AGENTS.md) | Human-facing tutorials (adding POCs, backend integration, testing) that must stay in sync with real code. |
| [`.github/workflows/`](./.github/workflows/AGENTS.md) | GitHub Actions CI gates (lint/typecheck/vitest+coverage/Playwright E2E) and security scanning (`security.yml`: `npm audit` + Trivy + CodeQL). |

## Global rules & conventions

These cross-cutting invariants apply repo-wide. A lesser agent **must** respect them:

1. **Dual registration for a new POC.** *Frontend:* add `const XxxPOC = React.lazy(() => import("../pages/pocs/Xxx"))` **and** a `POC_CONFIG` entry in `src/config/pocs.ts`. *Backend (if it needs an API):* add `import xxx from "./pocs/<id>"` **and** `api.route("/pocs/<id>", xxx)` in `server/routes.ts`, plus the module file in `server/pocs/`. Forgetting either half means the POC won't route / the API 404s.
2. **Use `POCLayout`.** Every POC page wraps its content in `<POCLayout title subtitle badge badgeType pocId>` for consistent chrome (breadcrumb, experiment switcher, backend-link button, footer). Pass `pocId` to surface the backend API link.
3. **Lazy loading.** POC components are loaded via `React.lazy` and rendered under `<Suspense>`. Keep **default exports** — `React.lazy` requires them.
4. **Hybrid styling + `$`-transient props.** Layout/spacing via Tailwind utility classes, usually applied through `styled.tag.attrs({ className: "..." })\`\`` (empty template). Dynamic/stateful styles use styled-components with **transient props prefixed with `$`** (e.g. `$active`, `$type`, `$isOpen`) so they aren't forwarded to the DOM. Badge color logic (`badgeType` → Tailwind classes) is **duplicated** in `Navbar.tsx` and `POCLayout.tsx`; the color-by-type mapping is consistent between them (only sizing/padding differs by context — Navbar `px-1.5 py-0.5 text-[8px]` vs POCLayout `px-2 py-0.5 text-[10px]`) — keep them in sync when adding a badge type.
5. **Scaffolder naming derivation.** `id = kebab-case(name)`; `componentName = PascalCase(name)`; frontend file = `<ComponentName>.tsx` in `src/pages/pocs/`; lazy const = `<ComponentName>POC`; backend file = `<id>.ts` in `server/pocs/`; backend import identifier = `camelCase(id)`.
6. **Backend state is in-memory** (e.g. `server/pocs/todo.ts` holds `let todos = [...]`). It resets on restart and is **not** production-durable — POC scope only.
7. **TypeScript compiler flags** (`tsconfig.app.json` / `tsconfig.node.json`) — note `"strict": true` is **not** set, so `strictNullChecks`/`noImplicitAny` are off; the enforced flags are: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` (use `import type` for type-only imports), `erasableSyntaxOnly` (**no** runtime-emitting TS-only syntax: no enums, no parameter properties, no namespaces — use `type`/`interface`/`as const`), `moduleResolution: bundler`, `jsx: react-jsx` (no need to import React just for JSX). App code targets the browser (`tsconfig.app`); Node config files target node (`tsconfig.node`).
8. **Three.js / WebGL lifecycle.** Set up scene/camera/renderer inside `useEffect`; in cleanup you **must** dispose geometries, materials, renderer, and controls, `cancelAnimationFrame`, remove the resize listener, and remove the canvas from the container — otherwise the SPA leaks GPU memory on navigation. Cap `renderer.setPixelRatio` at `Math.min(devicePixelRatio, 2)`.
9. **Coverage gate.** Vitest enforces **80%** for lines/functions/branches/statements (`vitest.config.ts`), and **`src/config/**` is excluded** from coverage. Unit tests are colocated `*.test.tsx`, run in jsdom with globals enabled; `src/setupTests.ts` imports `@testing-library/jest-dom`. E2E/visual tests live in `e2e/` (Vitest excludes `e2e/**`).
10. **Scaffolder anchor-string fragility.** `create-poc` edits `src/config/pocs.ts` and `server/routes.ts` by string/regex matching. It relies on anchor strings staying intact: the literal `export const POC_CONFIG: POCMetadata[] = [`, the last `React.lazy(...)` import line, and the last `api.route(...)` line. Reformatting those anchors can break the scaffolder.
11. **Template placeholder tokens.** Files in `scripts/templates/` use tokens replaced by the scaffolder: `__NAME__` (display name), `__COMPONENT_NAME__` (PascalCase), `__ID__` (kebab id), `__FILE_NAME__` (file name). These template files are **ESLint-ignored** (`globalIgnores` in `eslint.config.js`) and are **not** standalone-valid TS — do not lint/typecheck/execute them directly.

## Root files

Top-level config lives at the repo root:

- **`package.json`** — scripts, dependencies, `"type": "module"`; package manager is npm.
- **`vite.config.ts`** — React + Tailwind plugins; port 5180 (`strictPort`); proxies `/api` and `/ws` to `:3001` (`/ws` with `ws: true`).
- **`vitest.config.ts`** — merges `vite.config.ts`; jsdom, globals, `setupFiles: ./src/setupTests.ts`; excludes `e2e/**`; 80% coverage thresholds; excludes `src/config/**` from coverage.
- **`eslint.config.js`** — flat config; `globalIgnores(['dist', 'scripts/templates'])`; JS/TS + react-hooks + react-refresh recommended presets.
- **`tsconfig.json`** — solution file referencing `tsconfig.app.json` (browser, `src`), `tsconfig.node.json` (node, `vite.config.ts`), and `tsconfig.server.json` (node, `server`). All enforce the compiler flags in rule 7 (none sets `"strict": true`). Because `tsconfig.server.json` is referenced, `tsc -b` (used by `npm run build` and CI) now type-checks `server/` too.
- **`playwright.config.ts`** — `testDir: ./e2e`, `baseURL: http://localhost:5180`, `webServer` auto-runs `npm run dev`; chromium project; CI retries.
- **`index.html`** — Vite entry HTML; mounts `#root`, loads `/src/main.tsx`.
- **`Dockerfile`** — multi-stage (deps → build → runtime) on `node:22-alpine`; builds `dist/`, copies `server/`, runs `node --import tsx server/index.ts`, exposes 3001, `/health` healthcheck.
- **`README.md`** — human getting-started guide and POC-authoring walkthrough.
- **`ARCHITECTURE.md`** — design philosophy: POC model, frontend/backend bridge, scaffolding, styling, state, deployment.
