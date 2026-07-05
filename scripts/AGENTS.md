# AGENTS.md — scripts

_The POC scaffolding CLI lives here; this file guides agents editing the generator and its templates._

## Purpose
`scripts/` holds the `create-poc` code generator that scaffolds a new Proof-of-Concept end-to-end: it copies a template from `scripts/templates/`, substitutes placeholder tokens, writes the React page component, and then **mutates two source-of-truth files by string/regex matching** — `src/config/pocs.ts` (frontend registry) and `server/routes.ts` (backend router). It is plain ESM Node (`fs`/`path`/`url`, no deps) invoked via `npm run create-poc`. Because it edits code textually (no AST), it depends on specific anchor strings staying intact in those neighbor files.

## Files
- `create-poc.mjs` — **the live generator** (`npm run create-poc` → `node scripts/create-poc.mjs`). Parses argv, derives names, copies/token-substitutes a template, writes the component, and edits `pocs.ts` + optionally `routes.ts`.
- `create-poc.mjs.bak` — **stale backup, NOT executed by any npm script.** It has two bugs vs. the live file: `templateDir` resolves one level too high (`../scripts/templates`), and it uses the raw hyphenated `id` as the backend import identifier (`import my-poc ...` — invalid JS) instead of the camelCased `camelId`. Do not restore or copy from it without fixing those.
- `templates/frontend/{basic,webgl,websocket,webrtc,api,todo}.tsx` — frontend page templates (one per `type`).
- `templates/backend/{basic,todo}.ts` — Hono module templates. Only `todo` has a dedicated template; every other backend type uses `basic.ts`.

## Conventions & best practices
- **ESM only** (`import fs from 'fs'`), `.mjs` extension, `type: module` repo. Use `fileURLToPath(import.meta.url)` for `__dirname` (already set up).
- **Idempotent guards** — every write is gated: component write skipped if the file exists; config edit skipped if `configContent.includes(`${componentName}POC`)`; route edit skipped if `routesContent.includes('./pocs/'+id)`. Preserve this pattern when adding steps so re-runs don't duplicate.
- **String replacement, not AST.** Inserts use `String.replace(anchor, anchor + '\n' + newLine)`. Keep anchor literals in sync with the neighbor files (see below).
- **Naming derivation (must match `src/config/pocs.ts` house style):**
  - `id` = `pocName.toLowerCase().replace(/\s+/g,'-')` (kebab; **only spaces are handled** — punctuation passes through).
  - `componentName` = PascalCase (`(^\w|\s\w)`→upper, spaces removed).
  - `fileName` = `${componentName}.tsx`; lazy const = `${componentName}POC`; backend file = `${id}.ts`; backend import ident = `camelId` = kebab→camel via `id.replace(/-([a-z])/g, g => g[1].toUpperCase())`.
- **Token replacement** is global regex: `__NAME__`, `__COMPONENT_NAME__`, `__ID__`, `__FILE_NAME__`, `__BINDING__`. Backend templates receive `__NAME__`, `__ID__` (path strings/comments only), and `__BINDING__` (= `camelId`, the camelCase id used as the Hono instance variable + `export default`, so multi-word names stay valid identifiers). `__BINDING__` is substituted before `__ID__` (create-poc.mjs L141–142).
- **Type-specific literal fix-ups**: after token replacement the script runs a `webgl` branch and a `websocket|api|todo|webrtc` branch of `.replace(...)` passes. Only `webgl`, `websocket`, and `webrtc` templates actually contain hardcoded literals (e.g. `title="WebGL Template"`, `pocId="webgl-template"`, `pocId="websocket"`); `api.tsx`/`todo.tsx` are fully tokenized (`__COMPONENT_NAME__`/`__NAME__`/`__ID__`), so their fix-up regexes (`pocId="api"`, `pocId="todo"`, …) never match and no-op. Two fix-ups **silently no-op even for the types that need them**: the websocket/webrtc export-function rename builds `WebsocketPOC`/`WebrtcPOC` (naive `type.charAt(0).toUpperCase()`, L74) but the templates export `WebSocketPOC`/`WebRTCPOC`, so the rename never fires — harmless, since the default-export name is irrelevant to lazy imports. If you rename a real literal inside a template, update the matching `.replace(...)` in `create-poc.mjs` or that fix-up silently no-ops too.

## Business rules & cross-file awareness
- **Frontend registry `../src/config/pocs.ts`** — new lazy `const` is inserted **after the last** `const … = React.lazy(…)` line; the new `POC_CONFIG` object is inserted **immediately after** the anchor `export const POC_CONFIG: POCMetadata[] = [` (i.e. prepended to the top of the array). Generated entries hardcode `badge: 'POC'`, `badgeType: 'POC'`, `description: 'Research experiment into <Name>.'`, and `category` from the map: `webgl→Graphics`, `websocket|webrtc|api→Network`, `todo→State`, else `General`. This file is coverage-excluded (`vitest.config.ts`), so no test is generated for it.
- **Backend router `../server/routes.ts`** — only touched when `--backend`/`-b` OR `type` ∈ {`todo`,`api`,`websocket`} (note: **`webrtc` does NOT auto-create a backend**). Import is inserted after the last `import … from './pocs/…'`; `api.route('/pocs/<id>', <camelId>)` after the last `api.route('…', …)`. Fallback anchors are `import hello from './pocs/hello'` / `api.route('/pocs/hello', hello)` if none match. The mounted module's routes are relative to the `/api/pocs/<id>` mount point.
- **Backend template identifier (`__BINDING__`):** both `templates/backend/{basic,todo}.ts` use the dedicated `__BINDING__` token for the Hono instance and default export — `const __BINDING__ = new Hono()` … `export default __BINDING__` — while `__ID__` remains only in path strings/comments (the `/api/pocs/__ID__` mount comment and `poc: '__ID__'`). The generator computes `camelId` near the top (create-poc.mjs L32) and substitutes `__BINDING__` → `camelId` (L141), so a multi-word name like `"My Multiword POC"` now emits a valid `const myMultiwordPoc = new Hono()`. _(Historically these templates reused `__ID__` as the identifier, which produced the invalid `const my-multiword-poc = new Hono()` for multi-word names — now resolved.)_
- **Anchor strings that MUST stay intact** (elsewhere in the repo): the literal `export const POC_CONFIG: POCMetadata[] = [`; at least one `React.lazy(...)` import line in `pocs.ts`; `import … from './pocs/…'` and `api.route('…', …)` lines in `routes.ts`. Reformatting these (e.g. multi-line the `api.route` call) breaks the generator.
- **Ports:** frontend dev is Vite **5180** (strictPort) and backend Hono is **3001**; the proxy forwards `/api` + `/ws`. Templates should fetch relative paths (`/api/pocs/<id>`), never hardcode `http://localhost:3001` (except POCLayout's external link button).
- **Badge-type map** for the chrome is duplicated in `Navbar.tsx` and `POCLayout.tsx`; the generator only ever emits `POC`, so no new badge type is introduced here.

## When you add or change files here
1. To add a new **`type`**, create `templates/frontend/<type>.tsx` (using `__NAME__`/`__COMPONENT_NAME__`/`__ID__`/`__FILE_NAME__` tokens) — templates are ESLint-ignored and not standalone-valid TS, so don't lint/typecheck/run them.
2. Add the type to the `categoryMap` in `create-poc.mjs` and to the usage/help text block (lines listing available types) so it's discoverable.
3. If the new type needs a backend, add it to the auto-backend condition (`type === '…'`) and, if it needs custom server logic, add `templates/backend/<type>.ts` plus the `serverTemplatePath` branch (currently only `todo` is special-cased).
4. If the type has hardcoded literals (not tokens), add a `.replace(...)` fix-up block mirroring the existing `webgl` and `websocket`/`webrtc` literal fix-ups (the `websocket|api|todo|webrtc` branch also matches the already-tokenized `api`/`todo`, but those no-op).
5. Smoke-test: `npm run create-poc "Test Name" <type> --backend`, then verify `src/config/pocs.ts`, `server/routes.ts`, `src/pages/pocs/<Component>.tsx`, and `server/pocs/<id>.ts`, and revert the generated files. Multi-word names are fine: `"Test Name"` now generates a valid `const testName = new Hono()` in `server/pocs/test-name.ts` (via the `__BINDING__`/`camelId` token).

## Gotchas
- **Printed URL is wrong:** the success log prints `http://localhost:5173/pocs/<id>`, but the real Vite dev port is **5180** (`vite.config.ts` strictPort). The API URL (`http://localhost:3001/...`) is correct. Fix the log, don't trust it.
- **Component write vs. config write can desync:** if `src/pages/pocs/<Component>.tsx` already exists it's skipped with a warning, but `pocs.ts` is still edited when the lazy const is absent — you can end up with a config entry pointing at a stale file.
- **Non-space punctuation in names** (`&`, `/`, quotes) is not stripped by the `id`/`componentName` regexes and can produce invalid identifiers/paths — pass clean, space-separated names.
- **`create-poc.mjs.bak` is a trap** — it looks like a fallback but is broken (see Files). Never `mv` it over `create-poc.mjs`.
- Entries are **prepended** to `POC_CONFIG` (top of array), so a newly scaffolded POC appears first in the navbar/switcher ordering.

## Related
- Parent / repo root: [../AGENTS.md](../AGENTS.md)
- Frontend registry the generator mutates: [../src/config/pocs.ts](../src/config/pocs.ts) — see [../src/config/AGENTS.md](../src/config/AGENTS.md)
- Backend router the generator mutates: [../server/routes.ts](../server/routes.ts)
- Chrome wrapper referenced by generated pages: [../src/components/POCLayout.tsx](../src/components/POCLayout.tsx)
