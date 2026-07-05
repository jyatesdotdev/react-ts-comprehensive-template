# AGENTS.md — scripts/templates/backend

_Placeholder-token Hono module templates the `create-poc` scaffolder copies into `server/pocs/<id>.ts`; this file guides agents editing the backend templates in this directory._

## Purpose
These `.ts` files are **source templates**, not runnable modules. `scripts/create-poc.mjs` reads one of them, substitutes placeholder tokens, and writes the result to `server/pocs/<id>.ts`, then wires it into `server/routes.ts`. They define the house shape of a POC backend: a `new Hono()` instance with routes relative to its `/api/pocs/<id>` mount point and a default export. Editing a file here changes every future generated backend of that type.

## Files
- `basic.ts` — minimal backend template: `const __BINDING__ = new Hono()` with a single `GET /` returning `c.json({ message, poc: '__ID__', timestamp })`. Used for any `--backend` POC whose type is not `todo`.
- `todo.ts` — CRUD example template: in-memory `let items = [...]` with `GET /`, `POST /` (reads `await c.req.json()`, returns `c.json(newItem, 201)`), `PATCH /:id/toggle`, `DELETE /:id`. Used when the POC type is `todo`.

Both are excluded from tooling: outside the tsconfig `include` globs (`tsconfig.app.json` includes only `src`) and listed in `globalIgnores(['dist', 'scripts/templates'])` in `eslint.config.js`, so ESLint reports nothing rather than failing. The raw `__NAME__`/`__ID__`/`__BINDING__` tokens are valid JS identifiers / string contents, so the files parse and typecheck cleanly on their own — they are just only meaningful after token substitution. Do not lint, typecheck, run, or import them directly.

## Conventions & best practices
- **Three tokens are substituted here.** The scaffolder replaces `__NAME__` (display name), `__BINDING__` (camelCase id — the Hono instance/export identifier), and `__ID__` (kebab id — string content only) in backend templates — see `create-poc.mjs` lines ~139-142, where `__BINDING__` is replaced **before** `__ID__`. It does **not** substitute `__COMPONENT_NAME__` or `__FILE_NAME__` for backend files, so never use those tokens here.
- **`__BINDING__` is the const/export identifier** (`const __BINDING__ = new Hono()` … `export default __BINDING__`) and resolves to a camelCase id, always a valid JS identifier, so multi-word names are safe. **`__ID__` appears only in strings/comments** — the mount comment `Mounted at /api/pocs/__ID__` and the response field `poc: '__ID__'`. Keep each token in its lane: never use `__ID__` as an identifier or `__BINDING__` inside a string.
- **Hono idioms to match:** `new Hono()`, chained `.get/.post/.patch/.delete('/path', (c) => …)`, `c.json(payload)` or `c.json(payload, statusCode)`, read body via `await c.req.json()`, read path params via `c.req.param('id')` (then `parseInt(...)`).
- **Routes are relative to the mount point** — write `.get('/')`, `.patch('/:id/toggle')`, never re-prefix with `/api/pocs/<id>` (that prefix comes from `api.route(...)` in `server/routes.ts` + the `/api` mount in `server/index.ts`).
- **Always `export default` the Hono instance** — `server/routes.ts` imports it as a default (`import xxx from './pocs/<id>'`).
- Keep templates plain: no `import type` needed unless you add types; strict TS rules (`noUnusedLocals`, `verbatimModuleSyntax`, `erasableSyntaxOnly` — no enums/namespaces) apply to the **generated** file once tokens are filled.

## Business rules & cross-file awareness
- **Registration is done by the scaffolder, not by these templates.** After generating `server/pocs/<id>.ts`, `create-poc.mjs` edits `server/routes.ts`: it appends `import <camelId> from './pocs/<id>'` after the last `import … from './pocs/…'` line, and `api.route('/pocs/<id>', <camelId>)` after the last `api.route(…)` line. Those two lines are **anchor strings** — do not reformat existing imports/routes in `server/routes.ts` or the regex match fails.
- The backend import identifier is `camelCase(id)` (e.g. id `dashboard-test` → `dashboardTest`), matching existing modules in `server/pocs/`.
- Backend is generated only when `--backend`/`-b` is passed **or** the type is `todo`, `api`, or `websocket` (`create-poc.mjs` line ~128). For `todo` the `todo.ts` template is used; otherwise `basic.ts`.
- **State is in-memory** (`let items`) — resets on every server restart, POC scope only, not durable. Do not add a real DB here.
- Frontend fetches the **relative** path `/api/pocs/<id>` (Vite proxies `/api` → `http://localhost:3001`); the API listens on port **3001**. Never hardcode `http://localhost:3001` in template response logic.
- Sibling `scripts/templates/frontend/` holds the matching page templates; `src/config/pocs.ts` is the frontend registry. A `--backend` POC is dual-registered (frontend config + backend routes) — see the root/parent AGENTS.md.

## When you add or change files here
Adding a new backend template `<type>.ts` (or editing an existing one):
1. Start from `basic.ts`; keep `import { Hono } from 'hono'`, `const __BINDING__ = new Hono()`, and `export default __BINDING__`.
2. Use `__NAME__`, `__BINDING__` (for identifiers — const/export), and `__ID__` (for strings/comments only) placeholders.
3. Write routes relative to the mount point and return via `c.json(...)`.
4. To make the scaffolder select the new type, update the backend-template selection logic in `scripts/create-poc.mjs` (the `type === 'todo' ? 'todo' : 'basic'` branch, line ~129) and the generation trigger list (line ~128) if needed.
5. Do **not** lint/typecheck the template; instead scaffold a throwaway POC (`npm run create-poc "Test Name" <type> --backend`) and confirm `server/pocs/test-name.ts` compiles and `server/routes.ts` gains a valid import + route.

## Gotchas
- The raw `__NAME__`/`__ID__`/`__BINDING__` placeholders are intentional — do not "fix" them by removing tokens. The templates are never checked in raw form anyway (outside the tsconfig `include` globs and in `globalIgnores`), and stripping tokens to satisfy tooling would break the scaffolder.
- `__NAME__` interpolates the raw display name into strings (e.g. `'Hello from the __NAME__ backend!'`); it is not escaped, so avoid quotes/apostrophes assumptions in template copy.
- The scaffolder's success log still prints `http://localhost:5173` for the web URL; the actual Vite port is `5180` — ignore the stale log line, it does not affect generated code.

## Related
- Parent: [../AGENTS.md](../AGENTS.md) (`scripts/templates` — token conventions)
- Root: [../../../AGENTS.md](../../../AGENTS.md)
- Scaffolder: [../../AGENTS.md](../../AGENTS.md) (`scripts`) and [../../create-poc.mjs](../../create-poc.mjs)
- Backend targets: [../../../server/pocs/AGENTS.md](../../../server/pocs/AGENTS.md), [../../../server/routes.ts](../../../server/routes.ts), [../../../server/index.ts](../../../server/index.ts)
- Frontend registry: [../../../src/config/pocs.ts](../../../src/config/pocs.ts)
