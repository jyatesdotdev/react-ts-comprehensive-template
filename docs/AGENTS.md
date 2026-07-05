# AGENTS.md — docs

_Human-facing tutorials for the Research Lab template; this file guides agents editing the docs so the prose stays in sync with the real POC/backend/testing code._

## Purpose
This directory holds Markdown walkthroughs that teach a human how to add POCs, extend the Hono backend, and write tests. These docs are **not** compiled, linted, or typechecked — their code snippets can silently drift from the real source of truth. When you change behavior in `src/config/pocs.ts`, `server/routes.ts`, the scaffolder (`scripts/create-poc.mjs`), or the Vitest/Playwright config, update the matching doc here so instructions stay accurate.

## Files
- `adding-pocs.md` — tutorial for creating a POC via `npm run create-poc "<Name>" [type] [--backend]` (types: basic, webgl, websocket, webrtc, api, todo) and the manual path (create `src/pages/pocs/<Component>.tsx`, then register the `React.lazy` const + `POC_CONFIG` entry in `src/config/pocs.ts`).
- `backend-integration.md` — tutorial for adding a `server/pocs/<id>.ts` module (`new Hono()` with relative routes) and mounting it via `api.route('/<id>', module)` in `server/routes.ts`; covers the `/api` proxy and the `/ws` echo WebSocket in `server/index.ts`.
- `testing.md` — tutorial for Vitest unit tests (`*.test.tsx`, jsdom), Playwright E2E (`e2e/`), and screenshot/visual tests (`npm run test:screenshots`, baselines in `e2e/screenshots/`).

## Conventions & best practices
- **Markdown only** — GitHub-flavored Markdown with fenced code blocks tagged by language (`bash`, `tsx`, `typescript`). Match the existing heading structure (`# Tutorial: ...`, numbered `##` sections, a trailing `## Reference Links` list).
- **Keep snippets runnable-shaped and strict-TS-safe.** Real POC components need a **default export** (React.lazy requires it) and do **not** need `import React` just for JSX (`jsx: react-jsx`); strict mode has `noUnusedLocals`, so never show an unused import. Use `import type` for type-only imports in any snippet you add.
- **Relative fetch paths only.** Frontend snippets must fetch relative paths like `/api/<id>/...` (Vite proxies `/api` and `/ws` to the backend) — never hardcode `http://localhost:3001` in a component snippet.
- **Command examples use npm scripts** from `package.json`: `npm run create-poc`, `npm run dev`, `npm run test`, `npm run test:watch`, `npm run test:e2e`, `npm run test:screenshots`. Prefer these over raw tool invocations.
- Name examples consistently with the scaffolder's derivation: `id` = kebab-case, component file = PascalCase `<Name>.tsx`, lazy const = `<Component>POC`, backend file = `<id>.ts`.

## Business rules & cross-file awareness
- **Single source of truth:** `../src/config/pocs.ts` defines `POCMetadata` and `POC_CONFIG`; adding an entry there auto-wires routing (`../src/App.tsx`), the navbar dropdown (`../src/components/Navbar.tsx`), and the POCLayout switcher (`../src/components/POCLayout.tsx`). `adding-pocs.md` must describe this dual registration accurately.
- **Ports:** frontend Vite `5180` (strictPort), backend Hono `3001`. `testing.md`'s Playwright baseURL is `http://localhost:5180`; `backend-integration.md` may reference `http://localhost:3001` only for the backend's own URL, not for in-app fetches. Keep these numbers correct if the config changes.
- **Backend registration** in `../server/routes.ts` = an `import` line + an `api.route('/pocs/<id>', module)` line; mount point is `/api/pocs/<id>`. `backend-integration.md`'s example mounts at `api.route('/pocs/my-experiment', module)` and cites `http://localhost:3001/api/pocs/my-experiment/*`, matching this convention — keep any backend tutorial you add mirroring the real `/api/pocs/<id>` mount pattern.
- **Coverage gate:** `../vitest.config.ts` enforces **80%** on lines/functions/branches/statements and **excludes `src/config/**`**. If `testing.md` gains a coverage section, state 80% and the config exclusion — don't invent other thresholds.
- **Scaffolder anchors:** `scripts/create-poc.mjs` edits `pocs.ts`/`routes.ts` by string/regex matching (`export const POC_CONFIG: POCMetadata[] = [`, the last `React.lazy(...)` import, the last `api.route(...)`). Docs describing manual edits should not encourage reformatting those anchor lines.
- **Templates** referenced by `adding-pocs.md` live in `scripts/templates/frontend/` (`basic.tsx`, `webgl.tsx`, `websocket.tsx`, `webrtc.tsx`, `api.tsx`, `todo.tsx`) and `scripts/templates/backend/`; all are ESLint-ignored, non-standalone-valid TS, so don't tell readers to lint/run them directly. Personalization is **not** uniform: only `basic.tsx`/`api.tsx`/`todo.tsx` use `__NAME__`/`__COMPONENT_NAME__`/`__ID__` tokens (and only `basic.tsx` also uses `__FILE_NAME__`), and the backend templates use `__NAME__`/`__ID__`/`__BINDING__` (`__BINDING__` = the camelCase id, a valid JS identifier used for the `new Hono()` instance variable + default export so multi-word names scaffold cleanly; `__ID__` stays in strings/comments only); but `webgl.tsx`/`websocket.tsx`/`webrtc.tsx` contain **no** tokens — the scaffolder copies them and applies hard-coded string replacements (`scripts/create-poc.mjs` lines 65-77, e.g. `export default function WebGLTemplate()` → `<Component>POC` and `title="WebGL Template"` → the POC name).

## When you add or change files here
1. Read the code you are documenting first (`../src/config/pocs.ts`, `../server/routes.ts`, `../server/index.ts`, `../vitest.config.ts`, `scripts/create-poc.mjs`) so paths, ports, script names, and exports in the prose match reality.
2. Write/adjust the tutorial in GFM, keeping the `# Tutorial: ...` + numbered `##` + `## Reference Links` shape.
3. Verify every command against `package.json` scripts and every file path against the repo — a wrong path in a doc is the main failure mode here.
4. Keep snippets strict-TS-clean (default exports for lazy pages, no unused `import React`, relative fetch paths, `import type` for types).
5. If your change alters real behavior (new POC type, new script, changed port/threshold), update the sibling docs and the neighboring source's own AGENTS.md notes so they stay consistent.

## Gotchas
- These docs are **not** in the test/lint/type pipeline — nothing catches stale snippets. Manual accuracy is the only guard.
- `adding-pocs.md`'s manual snippet shows `import React` for a plain component; real strict-mode POC pages omit it (React import is only needed in `pocs.ts` for `React.lazy`). Don't propagate an unused import as house style.
- Playwright E2E needs the dev server; Playwright auto-starts `npm run dev`, but `testing.md` still tells readers to run it — keep guidance aligned with the actual `playwright.config` webServer behavior if it changes.
- Badge-type → Tailwind color logic is duplicated in `Navbar.tsx` and `POCLayout.tsx`; if a doc adds a new badge type example, note that both must be updated (badge types: `WIP|POC|STABLE|Template`).
- Backend POC state is in-memory (resets on restart); if a doc implies persistence, clarify it's POC-scope only.

## Related
- Parent / root: [../AGENTS.md](../AGENTS.md)
- POC registry: [../src/config/pocs.ts](../src/config/pocs.ts)
- Backend router: [../server/routes.ts](../server/routes.ts) · entry [../server/index.ts](../server/index.ts)
- Shared chrome: [../src/components/POCLayout.tsx](../src/components/POCLayout.tsx) · [../src/components/Navbar.tsx](../src/components/Navbar.tsx)
- Scaffolder: [../scripts/create-poc.mjs](../scripts/create-poc.mjs) · templates in [../scripts/templates](../scripts/templates)
- Test config: [../vitest.config.ts](../vitest.config.ts) · proxy/ports [../vite.config.ts](../vite.config.ts)
