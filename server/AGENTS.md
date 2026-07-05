# AGENTS.md — server

*The Hono backend for the POC lab: `index.ts` boots the server, `routes.ts` is the `/api` router — this file guides agents editing this directory.*

## Purpose
This directory is the Node/Hono backend that the Vite dev server proxies to. `index.ts` is the process entry (health check, WebSocket echo, static/SPA serving) and mounts the `/api` router from `routes.ts`. `routes.ts` wires each per-POC module in `server/pocs/*.ts` into the URL space so frontend POCs can call relative `/api/...` paths. Backend exists only for POCs that need an API — many POCs are frontend-only.

## Files
- `index.ts` — server entry. Creates `const app = new Hono()`, sets up `createNodeWebSocket({ app })`, registers `GET /health` → `{ status: 'ok' }`, mounts the API router with `app.route('/api', api)`, defines the global `GET /ws` echo WebSocket, serves `./dist` static + `index.html` SPA fallback, then `serve({ fetch: app.fetch, port })` on `PORT` or `3001` and `injectWebSocket(server)`.
- `routes.ts` — the `/api` router (`const api = new Hono()`). Defines `GET /hello` (connectivity ping) and `GET /webrtc/ice-servers` (STUN list), imports each POC module and mounts it via `api.route('/pocs/<id>', module)`, then `export default api`.
- `pocs/` — sibling directory of per-POC Hono modules (`hello.ts`, `todo.ts`, `dashboard-test.ts`, `ralph-experiment.ts`). Each `export default new Hono()` with routes relative to its mount point (see its own AGENTS.md / files).

## Conventions & best practices
- TypeScript conventions (governed by `tsconfig.server.json`, whose `include` is `["server"]` and whose flags mirror `tsconfig.node.json` — `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`/`noUnusedParameters`, `noFallthroughCasesInSwitch`, `noEmit`; it is referenced from the root `tsconfig.json`, so these ARE build-enforced via `tsc -b`, though `strict` is still NOT set here — consistent with the rest of the repo): use `import type` for type-only imports; NO enums / namespaces / parameter properties — use `type`/`interface`/`as const`; avoid unused locals/params.
- Handlers use the Hono context `c`: return JSON with `c.json(obj, status?)`, read params with `c.req.param('id')`, parse body with `await c.req.json()`. Match the existing terse style in `routes.ts` and `pocs/*.ts`.
- Mounting math: `index.ts` mounts `routes.ts` at `/api`, and `routes.ts` mounts a module at `/pocs/<id>`, so a module route `'/'` resolves to `GET /api/pocs/<id>`. Keep module routes RELATIVE to the mount — never re-prefix `/api` or `/pocs` inside a module.
- Ports/proxy: backend is `3001`; the frontend never hardcodes it — Vite proxies `/api` and `/ws` (see `vite.config.ts`). Do not add CORS or absolute origins for local dev.
- The `/ws` handler is a global echo used as a connectivity probe (`Echo from Hono: ...`); POC-specific realtime logic should live in a POC module, not be bolted onto this shared endpoint.
- Static serving (`serveStatic({ root: './dist' })`) and the `*` SPA fallback are prod-only concerns; they only serve content after `npm run build`.

## Business rules & cross-file awareness
- DUAL REGISTRATION: a POC needing an API requires BOTH halves. Backend half lives HERE: add `import xxx from './pocs/<id>'` AND `api.route('/pocs/<id>', xxx)` in `routes.ts`, plus the module file in `server/pocs/`. The frontend half (`React.lazy` + `POC_CONFIG` entry) is in `src/config/pocs.ts`. Forgetting the backend half makes the API 404.
- Import identifier is `camelCase(id)`, mount path uses the kebab `id` (e.g. `import dashboardTest from './pocs/dashboard-test'` → `api.route('/pocs/dashboard-test', dashboardTest)`). The `<id>` MUST match the frontend `POC_CONFIG` id so `/api/pocs/<id>` lines up with `POCLayout`'s backend-link button.
- SCAFFOLDER ANCHORS: `npm run create-poc "<Name>" [type] [--backend]` edits `routes.ts` by regex, appending after the LAST `api.route(...)` line. `--backend` is NOT the only trigger: the scaffolder also generates the backend module + `routes.ts` edit when `type` is `todo`, `api`, or `websocket` (`scripts/create-poc.mjs`: `if (withBackend || type === 'todo' || type === 'api' || type === 'websocket')`). Keep those `api.route(...)` lines together and conventionally formatted; reformatting/splitting them can break scaffolding. The generated backend module (`scripts/templates/backend/*.ts`) uses the `__BINDING__` token for the Hono instance variable and default export, which `create-poc.mjs` substitutes with `camelId` (the camelCase form of the kebab `id`) BEFORE substituting `__ID__` — so a multi-word name like `"My Multiword POC"` yields a VALID `const myMultiwordPoc = new Hono()` (not the old invalid `const my-multiword-poc`); `__ID__` survives only in path strings/comments.
- IN-MEMORY STATE: POC modules hold mutable module-level state (e.g. `pocs/todo.ts` `let todos = [...]`). It resets on restart and is NOT durable — POC scope only. Do not add databases here.
- TYPE-CHECKED / COVERAGE: `server/*.ts` IS now type-checked — `tsconfig.server.json` (`include: ["server"]`) is referenced from the root solution config, so both `npm run build` (`tsc -b && vite build`) AND CI (`npx tsc -b`) type-check the server. Type errors and unused locals/params in server files now FAIL the build, not just surface at RUNTIME. ESLint (`npx eslint .`, which matches `**/*.{ts,tsx}`) also covers this dir. Two caveats remain: `strict` is NOT enabled (no null-safety enforcement), and server code is still OUTSIDE the Vitest 80% frontend coverage gate. Note `tsx` (dev `tsx watch`, `start` `node --import tsx`) strips types to RUN the server without checking — the static safety net is `tsc -b`, not the runtime. Keep changes minimal and correctly typed by hand.

## When you add or change files here
Adding a backend API to a new POC with id `<id>`:
1. Create `server/pocs/<id>.ts` exporting `const <camelId> = new Hono()` ... `export default <camelId>`, with routes relative to the mount.
2. In `routes.ts`, add `import <camelId> from './pocs/<id>'` alongside the other POC imports.
3. In `routes.ts`, add `api.route('/pocs/<id>', <camelId>)` after the last existing `api.route(...)` line.
4. Ensure the matching frontend `POC_CONFIG` entry in `src/config/pocs.ts` uses the same `<id>`; frontend fetches the RELATIVE `/api/pocs/<id>`.
5. Run `npm run dev` (starts client + `tsx watch server/index.ts`) and hit `http://localhost:3001/health` or the proxied `/api/pocs/<id>` to verify.

## Gotchas
- The router in `routes.ts` is mounted at `/api` — a bare `api.get('/hello', ...)` is reachable at `/api/hello`, NOT `/hello`. Only `/health` and `/ws` live at the root (defined in `index.ts`).
- Order matters in `index.ts`: the `serveStatic('*')` + SPA `get('*')` catch-alls are LAST so they don't shadow `/api` and `/ws`. New root routes must be registered BEFORE those catch-alls.
- Dev uses `tsx watch server/index.ts` (no build step); prod/`start` uses `node --import tsx server/index.ts`. There is no separate compiled server output — `./dist` is the Vite CLIENT build, only present after `npm run build`.
- `PORT` env overrides `3001`; if you change the port you must also update the proxy target in `vite.config.ts` or the frontend `/api` calls will break.
- Modules mounted at `/pocs/<id>` must not include `/api` in their own paths — the double-prefix would make routes unreachable.

## Related
- Parent / repo root: [../AGENTS.md](../AGENTS.md)
- POC modules mounted here: [`pocs/`](pocs/) (e.g. [`pocs/todo.ts`](pocs/todo.ts), [`pocs/hello.ts`](pocs/hello.ts))
- Frontend POC registry (id must match): [`../src/config/pocs.ts`](../src/config/pocs.ts)
- Backend-link button consumer: [`../src/components/POCLayout.tsx`](../src/components/POCLayout.tsx)
- Dev proxy config: [`../vite.config.ts`](../vite.config.ts)
