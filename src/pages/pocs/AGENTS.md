# AGENTS.md — src/pages/pocs

_Each file here is one lazy-loaded POC experiment page; this file guides agents adding or editing pages in this directory._

## Purpose
This directory holds the individual Proof-of-Concept page components — the "experiments" of the Research Lab. Each file default-exports a React component that wraps its content in `<POCLayout>` for shared chrome (breadcrumb, experiment switcher, backend-link button, footer). A page only becomes routable/visible once it is registered in `src/config/pocs.ts` (which `React.lazy`-imports from here); `src/App.tsx`, `src/components/Navbar.tsx`, and `src/components/POCLayout.tsx` all render from that config. `Template.tsx` and `WebGLTemplate.tsx` are the copyable starting points.

## Files
- `Template.tsx` — **Copyable starting point** (basic). Static card page; header comment lists the copy → rename → register steps. `badge="Template"`, `badgeType="STABLE"`, no `pocId`. Registered as id `template` / name "New POC".
- `WebGLTemplate.tsx` — **Copyable starting point** (Three.js). Full scene: camera, renderer, `OrbitControls`, lights, grid, wireframe sphere, resize handler, and complete cleanup/disposal. Default export is `WebGLTemplate` (no `POC` suffix). `badgeType="Template"`.
- `API.tsx` (`APIPOC`) — Fetches `GET /api/hello` via the Vite proxy; shows loading/error/JSON states. No `pocId`.
- `Todo.tsx` (`TodoPOC`) — Full-stack CRUD against `/api/pocs/todo` (GET/POST, `PATCH /:id/toggle`, `DELETE /:id`); re-fetches after each mutation. Defines a local `interface Todo`. Passes `pocId="todo"` (backend lives in `server/pocs/todo.ts`).
- `WebSocket.tsx` (`WebSocketPOC`) — Connects to `` `${protocol}//${window.location.host}/ws` `` (proxied echo server); terminal-style message log with `$connected` status badge.
- `WebRTC.tsx` (`WebRTCPOC`) — Local two-`RTCPeerConnection` loopback call via `getUserMedia`; buttons use a `$variant` transient prop; tears down streams/connections on unmount.
- `WebGL.tsx` (`WebGLPOC`) — Minimal Three.js rotating `TorusKnotGeometry`, `badgeType="WIP"`. Note: its cleanup does NOT `cancelAnimationFrame` and does NOT dispose geometry/material — do not copy it as a template; use `WebGLTemplate.tsx`.
- `RalphExperiment.tsx` (`RalphExperimentPOC`) — WebGL experiment cloned from the WebGL template with interactive color/wireframe controls synced to Three.js objects via refs; full disposal in cleanup. Passes `pocId="ralph-experiment"` (backend lives in `server/pocs/ralph-experiment.ts`). Heads-up: the component sets `badge="Template"`/`badgeType="Template"`, but `pocs.ts` registers it as `badge:'POC'`/`badgeType:'POC'` — so the in-page header badge and the navbar/switcher badge differ.
- `DashboardTest.tsx` (`DashboardTestPOC`) — Scaffolded basic placeholder page; `pocId="dashboard-test"`.
- No `*.test.tsx` files currently colocated here.

## Conventions & best practices
- **Default export required** — every page must `export default function <Name>POC()` because `src/config/pocs.ts` loads it with `React.lazy`. The exported function name is cosmetic (see `WebGLTemplate`); the config lazy-const name is what matters.
- **Always wrap in `<POCLayout title subtitle badge badgeType pocId>`.** Only `title` and `children` are required; `badgeType` must be one of `'WIP' | 'POC' | 'STABLE' | 'Template'`. Pass `pocId` only when a matching `server/pocs/<id>.ts` exists — it renders the external "Backend API" button linking to the absolute `http://localhost:3001/api/pocs/<id>`.
- **Styling is hybrid.** Static styling: `styled.tag.attrs({ className: 'tailwind classes' })\`\`` with an empty template literal. Dynamic styling: `styled.tag.attrs<{ $prop }>((props) => ({ className: \`...\` }))<{ $prop }>\`\``. Use `$`-prefixed **transient props** (`$completed`, `$variant`, `$connected`) so they aren't forwarded to the DOM.
- **Fetch RELATIVE paths only** (`/api/...`, `/ws`) — the Vite dev server proxies these to `localhost:3001`. Never hardcode `http://localhost:3001` in a page (that URL belongs to POCLayout's link button alone).
- **TypeScript is strict**: no unused locals/params, `verbatimModuleSyntax` (use `import type` for type-only imports), no enums/namespaces/param-properties. `jsx: react-jsx` means you don't import React for JSX. The `React` namespace (e.g. `e: React.FormEvent`) is globally available via `@types/react`'s `export as namespace React`, so it may be imported but is not required — `WebSocket.tsx` uses `React.FormEvent` without importing React and still type-checks.
- **Three.js lifecycle**: build scene/camera/renderer inside `useEffect`; in cleanup you MUST `cancelAnimationFrame`, `renderer.dispose()`, dispose every geometry & material, `controls.dispose()`, remove the resize listener, and remove the canvas from the container. Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. Copy `WebGLTemplate.tsx`, not `WebGL.tsx`.

## Business rules & cross-file awareness
- **Registration is mandatory.** A new page here is invisible until you add BOTH `const XxxPOC = React.lazy(() => import('../pages/pocs/Xxx'))` AND a `POC_CONFIG` entry (`{ id, name, path: '/pocs/<id>', component, badge?, badgeType?, category?, description }`) in `../../config/pocs.ts`. That one config drives routing (`../../App.tsx`), the Navbar dropdown grouping by `category`, and POCLayout's experiment switcher.
- **Backend half (if the page calls an API):** add the module `server/pocs/<id>.ts` (exports `new Hono()`), plus `import <binding> from './pocs/<id>'` and `api.route('/pocs/<id>', <binding>)` in `../../../server/routes.ts`. The import binding must be a legal JS identifier, so **camelCase hyphenated ids** (e.g. `import dashboardTest from './pocs/dashboard-test'` / `api.route('/pocs/dashboard-test', dashboardTest)`) — the path string stays kebab-case. Missing this ⇒ the `/api/pocs/<id>` fetch 404s. Backend state is in-memory (see `server/pocs/todo.ts`) and resets on restart — POC scope only.
- **Scaffolder anchors:** `npm run create-poc "<Name>" [basic|webgl|websocket|webrtc|api|todo] [--backend]` edits `pocs.ts` and `routes.ts` by matching the literal `export const POC_CONFIG: POCMetadata[] = [`, the last `React.lazy(...)` import line, and the last `api.route(...)` line. Don't reformat those anchors. Note: a backend module + `routes.ts` entry is auto-generated whenever `type` is `api`, `todo`, or `websocket` (even without `--backend`), so expect an auto-created `server/pocs/<id>.ts` in those cases.
- **Badge-color duplication:** the `badgeType → Tailwind` mapping lives in BOTH `../../components/Navbar.tsx` and `../../components/POCLayout.tsx`. If you introduce a new badge type, update the union in `pocs.ts` + POCLayout props AND both mappings.
- **Coverage:** `src/config/**` is excluded from the 80% coverage gate, but page components here are NOT — a page with logic may need a colocated `*.test.tsx` (Vitest, jsdom) to keep coverage above threshold.

## When you add or change files here
1. Copy `Template.tsx` (basic) or `WebGLTemplate.tsx` (Three.js) to `<ComponentName>.tsx` (PascalCase; `id` = kebab-case).
2. Rename the default-export function and update `title`/`subtitle`/`badge`/`badgeType` on `<POCLayout>`.
3. In `../../config/pocs.ts`: add the `React.lazy` const and a `POC_CONFIG` entry (matching `path: '/pocs/<id>'`).
4. If it needs an API: add `server/pocs/<id>.ts`, then its `import` + `api.route('/pocs/<id>', ...)` in `../../../server/routes.ts`, and pass `pocId="<id>"` to `<POCLayout>`.
5. Use relative `/api` or `/ws` fetches; add a colocated `<ComponentName>.test.tsx` if the page has testable logic.
6. Run `npm run lint`, `npm run build` (tsc -b), and `npm test` before finishing.

## Gotchas
- Forgetting the `POC_CONFIG` entry (or the lazy import) means no route, no navbar link, no switcher entry — the page silently does not exist.
- Passing `pocId` for a POC with no backend module renders a "Backend API" button that 404s.
- `WebGL.tsx` is an intentionally minimal/incomplete example (no frame cancel, no geometry/material dispose) — copying it leaks GPU memory on SPA navigation.
- Non-transient dynamic props (without the `$` prefix) leak to the DOM as invalid HTML attributes; always prefix with `$`.
- `verbatimModuleSyntax` will error if you import a type without `import type`; unused imports/params fail the strict build and CI.

## Related
- Parent: [../AGENTS.md](../AGENTS.md)
- Root: [../../../AGENTS.md](../../../AGENTS.md)
- Registry (single source of truth): [../../config/pocs.ts](../../config/pocs.ts)
- Shared layout: [../../components/POCLayout.tsx](../../components/POCLayout.tsx) · Navbar: [../../components/Navbar.tsx](../../components/Navbar.tsx) · Router: [../../App.tsx](../../App.tsx)
- Backend router: [../../../server/routes.ts](../../../server/routes.ts) · example module: [../../../server/pocs/todo.ts](../../../server/pocs/todo.ts)
