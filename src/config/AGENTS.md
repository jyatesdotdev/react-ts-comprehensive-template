# AGENTS.md — src/config

_The POC registry lives here; this file guides agents editing this directory._

## Purpose
`src/config` holds `pocs.ts`, the **single source of truth** for every Proof-of-Concept in the repo. Its `POC_CONFIG` array is consumed by `src/App.tsx` (routing), `src/components/Navbar.tsx` (the Experiments dropdown, grouped by `category`), and `src/components/POCLayout.tsx` (the in-page experiment switcher). Add one entry here and the POC automatically appears in all three places — no other frontend wiring is needed for routing/nav.

## Files
- `pocs.ts` — exports the `POCMetadata` interface and the `POC_CONFIG: POCMetadata[]` array. Top of file declares one `React.lazy(() => import('../pages/pocs/<Component>'))` const per POC (named `<ComponentName>POC`), then lists each POC's metadata object. This is the only file in the directory.

There are no test files here: `src/config/**` is **excluded from coverage** (see `vitest.config.ts`), so do not add `pocs.test.ts` expecting it to count toward the 80% gate.

## `POCMetadata` shape (verify against the interface, don't guess)
- `id: string` — kebab-case, used for routing and backend API links (`/api/pocs/<id>`).
- `name: string` — display name.
- `path: string` — route path, by convention `/pocs/<id>`.
- `component: React.LazyExoticComponent<React.ComponentType<unknown>> | React.ComponentType<unknown>` — usually a `React.lazy` const.
- `badge?: string` — optional badge text.
- `badgeType?: 'WIP' | 'POC' | 'STABLE' | 'Template'` — optional; drives badge color. Extending this union means updating the badge→Tailwind maps in BOTH `Navbar.tsx` and `POCLayout.tsx`.
- `description: string` — required short summary.
- `category?: 'Graphics' | 'Network' | 'State' | 'Utility' | 'General'` — optional; Navbar groups by this.

## Conventions & best practices
- Keep the file's structure intact: lazy-import consts first, then the `POC_CONFIG` array. Match the existing 2-space indentation and single-quote style (no semicolons in the entries).
- POC components MUST have a **default export** — `React.lazy` requires it. Lazy-loading is deliberate: it keeps each POC out of the main bundle (App wraps routes in `<Suspense>`).
- `badge` and `badgeType` are independent optional fields; the `template` entry sets `badge: 'Template'` with NO `badgeType`, which is valid. Prefer setting both consistently for new POCs.
- TypeScript uses `verbatimModuleSyntax` + `noUnusedLocals`/`noUnusedParameters` (note: `strict` is NOT set): use `import type` for type-only imports. Note this file imports the `React` value (needed for `React.lazy`), so a plain `import React from 'react'` is correct here — do not switch it to `import type`.
- No enums / namespaces (`erasableSyntaxOnly`): the badge/category unions are string-literal unions, keep them that way. Use `as const` if you ever need a runtime list.

## Business rules & cross-file awareness
- **Dual registration:** adding a POC here handles only the frontend half. If the POC needs an API, you must ALSO add `import xxx from './pocs/<id>'` + `api.route('/pocs/<id>', xxx)` in `server/routes.ts` and create `server/pocs/<id>.ts`. Forgetting the backend half means the API 404s.
- **Scaffolder anchors:** `scripts/create-poc.mjs` edits this file by string/regex matching. It depends on the literal `export const POC_CONFIG: POCMetadata[] = [` line and on inserting after the LAST `React.lazy(...)` import line. Do NOT reformat, rename, or reorder those anchors or you break `npm run create-poc`.
- **Naming derived by the scaffolder:** `id = kebab-case(name)`, component file = `<PascalCase(name)>.tsx` in `src/pages/pocs/`, lazy const = `<ComponentName>POC`. Follow this so manual edits stay consistent with generated ones.
- **Relative paths only:** components fetch relative `/api/pocs/<id>` (Vite proxies `/api`→`:3001`). `id` here is what forms that path — keep it matching the backend mount in `server/routes.ts`.
- `id` and `path` must be unique across the array; duplicate routes collide in `App.tsx`.

## When you add or change files here (manual add of a POC)
1. Create the component `src/pages/pocs/<ComponentName>.tsx` with a **default export**, wrapping content in `<POCLayout ... pocId="<id>">`.
2. In `pocs.ts`, add `const <ComponentName>POC = React.lazy(() => import('../pages/pocs/<ComponentName>'))` after the existing lazy consts.
3. Add a `POC_CONFIG` object: `{ id, name, path: '/pocs/<id>', component: <ComponentName>POC, badge, badgeType, category, description }`.
4. If the POC needs a backend, register it in `server/routes.ts` and add `server/pocs/<id>.ts`.
5. Run `npm run lint` and `npm run build` (tsc -b); fix any unused-import/type errors.

## Gotchas
- Prefer `npm run create-poc "<Name>" [type] [--backend]` over hand-editing — it wires up both files correctly and respects the anchors.
- Removing a POC entry does NOT delete its `src/pages/pocs/<Component>.tsx` file or its `server/pocs/<id>.ts` backend route; clean those up separately.
- A lazy import path that doesn't resolve fails only at runtime (dynamic `import`), not always at typecheck — double-check the `../pages/pocs/<Component>` path.
- This file is coverage-excluded, so a broken entry won't be caught by unit tests — E2E (Playwright) is what exercises the actual routes.

## Related
- Parent: [../AGENTS.md](../AGENTS.md)
- Root: [/AGENTS.md](../../AGENTS.md)
- Consumers: `src/App.tsx`, `src/components/Navbar.tsx`, `src/components/POCLayout.tsx`
- Backend counterpart: `server/routes.ts`, `server/pocs/`
- Scaffolder: `scripts/create-poc.mjs`, templates in `scripts/templates/`
