# AGENTS.md — server/pocs

_Per-experiment Hono API modules with in-memory state; this file guides agents adding or editing backend POC modules here._

## Purpose
Each file here is a self-contained backend for one POC. A module exports a `new Hono()` app whose routes are written **relative to its mount point**, and `../routes.ts` mounts it under `/api/pocs/<id>` via `api.route('/pocs/<id>', module)`. The frontend POC page (in `src/pages/pocs/`) fetches these endpoints via relative paths like `/api/pocs/<id>` (Vite proxies `/api` → the Hono backend on port 3001). State lives in module-scope variables (in-memory only).

## Files
- `hello.ts` — minimal example: `GET /` returns `{ message, timestamp }`. Const is `hello`; mounted at `/api/pocs/hello`.
- `todo.ts` — CRUD-over-array example. Module-scope `let todos = [...]`; routes: `GET /` (list), `POST /` (add, 201), `PATCH /:id/toggle`, `DELETE /:id`. Coerces ids with `parseInt(c.req.param('id'))`; only `PATCH /:id/toggle` checks existence and returns `404 { error: 'Not found' }` when missing — `DELETE /:id` filters unconditionally and always returns `{ success: true }`. Mounted at `/api/pocs/todo`.
- `dashboard-test.ts` — stub `GET /` returning a hello payload. Note the kebab id but **camelCase const** `dashboardTest`. Mounted at `/api/pocs/dashboard-test`.
- `ralph-experiment.ts` — same stub shape; const `ralphExperiment`. Mounted at `/api/pocs/ralph-experiment`.

No test files or generated files live here. The reusable stubs these were cloned from are `scripts/templates/backend/basic.ts` (basic) and `scripts/templates/backend/todo.ts` (state) — those parse as valid TS on their own, and their *substituted* output is now valid even for multi-word ids: the Hono const and default export use the `__BINDING__` token (replaced with `camelCase(id)`), while `__ID__` survives only in the mount comment and strings. They are ESLint-ignored; do not edit them to change a live POC.

## Conventions & best practices
- **Shape:** `import { Hono } from 'hono'` → `const <camelId> = new Hono()` → attach routes → `export default <camelId>`. Always a default export (that is what `routes.ts` imports).
- **Relative routes only:** paths are relative to the mount point. Write `todo.get('/')` / `todo.patch('/:id/toggle')`, NOT `/pocs/todo/...`. The `/api/pocs/<id>` prefix is added by the mount in `routes.ts` + the `/api` mount in `server/index.ts`.
- **JSON I/O:** read bodies with `await c.req.json()`; respond with `c.json(data)` or `c.json(data, 201)`; path params via `c.req.param('id')` (coerce with `parseInt`).
- **In-memory state:** declare with `let`/`const` at module scope (e.g. `let todos`). Prefer immutable reassignment for deletes (`todos = todos.filter(...)`) as `todo.ts`/`todo` template do.
- **TS style (now enforced by tsc):** prefer no enums / namespaces / parameter properties; use `type`/`interface`/`as const`; `import type` for type-only imports; avoid unused locals/params. `tsconfig.server.json` (`include: ["server"]`, `types: ["node"]`) applies the same flags as `tsconfig.node.json` — `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`/`noUnusedParameters`, `noFallthroughCasesInSwitch`, `noEmit` — and is wired into `tsconfig.json` references, so `tsc -b` (build + CI) now type-checks `server/` (`erasableSyntaxOnly` is what bans enums/namespaces here). Note `strict` is still **not** set (consistent with the rest of the repo). At runtime `tsx` still transpiles server code with no typechecking, and ESLint (`eslint .`) also flags unused vars in server `*.ts`, but the enforcing gate is `tsc -b`.
- **Const naming:** the Hono const should be `camelCase(id)` (e.g. `dashboard-test` → `dashboardTest`) — this is the identifier `routes.ts` imports.

## Business rules & cross-file awareness
- **Dual registration:** a backend module does nothing until BOTH lines exist in `../routes.ts`: `import <camelId> from './pocs/<id>'` AND `api.route('/pocs/<id>', <camelId>)`. Missing either → `/api/pocs/<id>` 404s.
- **Frontend half:** the matching page component + `POC_CONFIG` entry live in `../../src/config/pocs.ts` / `src/pages/pocs/`. Keep the `id` here identical to the POC `id` there; the frontend fetches `/api/pocs/<id>`.
- **In-memory only:** all state resets on server restart (`tsx watch` reload too). POC scope only — never assume durability.
- **Ports/proxy:** backend Hono = 3001; frontend Vite = 5180 (strictPort) and proxies `/api` (and `/ws`) to 3001. Frontend must fetch relative paths; do not hardcode `http://localhost:3001` in components.
- **Scaffolder anchors:** `scripts/create-poc.mjs` edits `../routes.ts` by regex-matching the LAST `import ... from './pocs/...'` line and the LAST `api.route('...', ...)` line, then inserting after each. Keep those two anchor patterns (single-quoted, one per line) intact — reformatting breaks auto-registration.

## When you add or change files here
1. Preferred: `npm run create-poc "<Name>" <type> [--backend]` (backend auto-generated for `todo`/`api`/`websocket`, or force with `--backend`). Then verify the generated module + the two `routes.ts` lines.
2. Manual: create `server/pocs/<id>.ts` = `const <camelId> = new Hono()`, add routes relative to mount, `export default <camelId>`.
3. In `../routes.ts` add `import <camelId> from './pocs/<id>'` (after the last such import) and `api.route('/pocs/<id>', <camelId>)` (after the last route).
4. Ensure the frontend `POC_CONFIG` entry in `../../src/config/pocs.ts` uses the same `id`, and the page fetches `/api/pocs/<id>` (relative).
5. Run `npm run lint` (ESLint) **and** `npm run build` — `tsc -b` now type-checks `server/` via `tsconfig.server.json` (in addition to `tsconfig.app.json`/`src` and `tsconfig.node.json`/`vite.config.ts`), so both ESLint and tsc validate server POC files. `npm run build` (`tsc -b && vite build`) and CI (`tsc -b`) fail on a type-broken server POC (e.g. an enum, caught by `erasableSyntaxOnly`), though `tsx` still runs it untyped at dev time. Server POC files remain outside Vitest coverage.

## Gotchas
- **kebab id ≠ JS identifier (handled):** the backend template names the const via the `__BINDING__` token, which the scaffolder replaces with `camelCase(id)`, so a multi-word POC now scaffolds valid TS like `const dashboardTest = new Hono()` (not the old invalid `const dashboard-test = new Hono()`). That is why `dashboard-test.ts`/`ralph-experiment.ts` use `dashboardTest`/`ralphExperiment` while the file stays `dashboard-test.ts`. If you hand-write a module, still name the const (and its `export default`) `camelCase(id)`.
- **Mount vs. route path:** double-prefixing (writing `/pocs/todo/` inside the module) yields `/api/pocs/todo/pocs/todo` and a 404.
- **Restart wipes state:** don't write tests or flows that assume data persists across `tsx watch` restarts.
- **`c.req.json()` is async:** `await` it; forgetting yields a Promise, not the body.
- **Template files are not live code:** editing `scripts/templates/backend/*.ts` changes future scaffolds only. The templates are valid TS as-is, and their *substituted* output is now valid for multi-word ids too — the const/default export use the `__BINDING__` → `camelCase(id)` token, while `__ID__` remains only in the mount comment and strings (see the kebab-id gotcha above).

## Related
- Parent: [../AGENTS.md](../AGENTS.md)
- Repo root: [/AGENTS.md](../../AGENTS.md)
- Registry / mount router: [../routes.ts](../routes.ts) — mounts each module under `/api/pocs/<id>`.
- Backend entry: [../index.ts](../index.ts) — mounts `routes.ts` under `/api`, health check, `/ws` echo.
- Frontend POC registry: [../../src/config/pocs.ts](../../src/config/pocs.ts) — `id` must match here.
- Scaffolder: [../../scripts/create-poc.mjs](../../scripts/create-poc.mjs).
