# AGENTS.md — e2e

_Playwright E2E + screenshot-capture specs for the Research Lab; this file guides agents editing tests in this directory._

## Purpose
Browser-level tests that drive the running app through real navigation, assert on-page content, and capture full-page PNGs of every POC. They validate that POCs registered in `src/config/pocs.ts` actually route, render an `<h1>`, and throw no console/page errors. Playwright config lives at repo root (`../playwright.config.ts`): `testDir: ./e2e`, single `chromium` project, `baseURL: http://localhost:5180`, and a `webServer` that runs `npm run dev` (client on 5180 + Hono backend on 3001) and reuses an existing server outside CI.

## Files
- `example.spec.ts` — navigation smoke test: opens the **Experiments** dropdown (`button:has-text("Experiments")`), clicks the WebGL link, asserts URL `/.*webgl/` and `h1` = "WebGL Graphics", then "Back to Home" returns to `/` with `h1` = "Research Lab".
- `screenshots.spec.ts` — parameterized over the `POC_PATHS` array (`/`, `/pocs/ralph-experiment`, `/pocs/webgl`, `/pocs/webgl-template`, `/pocs/todo`, `/pocs/api`, `/pocs/webrtc`, `/pocs/websocket`, `/pocs/template`, `/pocs/dashboard-test`). `beforeAll` polls `http://localhost:3001/` (backend) up to 20×500ms to avoid 502s. Per path: waits for `h1` visible (10s), an extra 2s for any `webgl` path, writes `e2e/screenshots/<safeName>.png` full-page, then asserts **zero** console `error`/`pageerror` messages. Run alone via `npm run test:screenshots`.
- `tutorials.spec.ts` — navigates `/tutorials`, clicks "Adding POCs" and "WebGL / 3D" sections, asserts each `h1`, and writes `tutorials-overview.png`, `tutorials-adding.png`, `tutorials-webgl.png`.
- `screenshots/` — output/baseline PNGs written by the two screenshot specs (e.g. `home.png`, `pocs-webgl.png`, `tutorials-overview.png`). These are **overwritten** on every run (plain `page.screenshot`, not a `toHaveScreenshot` pixel-diff), so commit them intentionally.

## Conventions & best practices
- Import from `@playwright/test`: `import { test, expect } from '@playwright/test';`. Use `test.describe` + a `for` loop for parameterized cases (see `screenshots.spec.ts`).
- Always navigate with **relative** paths — `page.goto('/pocs/todo')` — never a hardcoded `http://localhost:5180`; `baseURL` resolves it. Only cross-server fetches (the 3001 backend readiness poll) use an absolute URL.
- Prefer text/role locators (`page.locator('h1')`, `page.click('text=Back to Home')`, `:has-text(...)`) over brittle CSS/IDs. Note the existing `:not(:has-text("Template"))` filter used to disambiguate the two WebGL nav links.
- Assert visibility with an explicit `timeout` before acting on async-rendered / lazy-loaded content (`toBeVisible({ timeout: 10000 })`); POC pages are `React.lazy` under `<Suspense>` so first paint is delayed.
- WebGL/Three.js pages need extra settle time before screenshotting — mirror the `waitForTimeout(2000)` guard on `webgl` paths.
- Collect console errors via `page.on('console', …)` **and** `page.on('pageerror', …)` registered **before** `page.goto`, then assert `toHaveLength(0)` with a message that lists the offending path — copy this pattern for new render-health checks.
- Screenshot `path` strings are resolved relative to the process CWD (repo root when Playwright runs), hence the `e2e/screenshots/...` prefix — keep that prefix.

## Business rules & cross-file awareness
- `POC_PATHS` in `screenshots.spec.ts` is a **manual mirror** of the routes generated from `../src/config/pocs.ts` (`POC_CONFIG`). Adding/removing/renaming a POC there does **not** auto-update this array — edit `POC_PATHS` to keep coverage in sync. Each path must match a POC `path` in `POC_CONFIG` (routed by `../src/App.tsx`) — **except `/`** (the Home route), which is not a POC and has no `POC_CONFIG` entry, so don't register one for it.
- These tests depend on real app chrome from `../src/components/Navbar.tsx` (the Experiments dropdown + category grouping) and `../src/components/POCLayout.tsx` (breadcrumb, "Back to Home", experiment switcher). Renaming that link text or the page `h1` copy breaks `example.spec.ts` / `tutorials.spec.ts`.
- POCs with an API (e.g. `/pocs/todo`, `/pocs/api`) hit the backend proxied via Vite `/api → localhost:3001`; the `beforeAll` backend poll exists because `webServer` may report 5180 ready before Hono is. Keep it when adding API-backed POC paths.
- `e2e/**` is **excluded** from Vitest and from the 80% coverage gate (`vitest.config.ts`); these are separate from unit tests (`*.test.tsx`, jsdom). Never colocate Playwright specs with unit tests or vice versa.
- Backend POC state is in-memory (resets on server restart), so screenshot content for stateful POCs reflects seed data only — don't assert on mutated/persisted values here.

## When you add or change files here
1. Name the spec `<feature>.spec.ts` in `e2e/` (Playwright picks up `testDir: ./e2e`).
2. `import { test, expect } from '@playwright/test';` and navigate with relative paths against `baseURL` 5180.
3. If it renders lazy content, `await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })` before asserting; add `waitForTimeout` for WebGL.
4. When adding a new POC route, append its `/pocs/<id>` string to `POC_PATHS` in `screenshots.spec.ts` so it gets a render-health + screenshot check.
5. Run `npm run test:e2e` (all) or `npm run test:screenshots` (screenshots spec only). The dev server auto-starts; commit any updated/added PNGs in `screenshots/`.

## Gotchas
- The screenshot specs are **not** visual regression — `page.screenshot()` silently overwrites the PNG and never diffs. The real assertion is "no console errors" (screenshots) / correct `h1` (tutorials). Don't expect a pixel-mismatch failure.
- `npm run test:screenshots` runs **only** `screenshots.spec.ts` — `tutorials.spec.ts` PNGs regenerate only under the full `test:e2e`.
- Outside CI, `reuseExistingServer` is true: a stale `npm run dev` on 5180 will serve old code. Kill it (5180 is `strictPort`) if results look outdated.
- A single unexpected `console.error` anywhere on the page fails the whole `screenshots.spec.ts` case — a noisy new dependency or dev warning can turn every path red.
- `beforeAll` only waits ~10s for the backend; a slow-booting Hono route can still produce a 502/console error on first load.

## Related
- Parent / repo root: [../AGENTS.md](../AGENTS.md) (e2e is a top-level directory, so parent == root).
- Playwright config: [../playwright.config.ts](../playwright.config.ts) — baseURL 5180, webServer `npm run dev`, chromium project.
- POC registry (source of truth for routes/paths mirrored in `POC_PATHS`): [../src/config/pocs.ts](../src/config/pocs.ts).
- App routing & chrome under test: [../src/App.tsx](../src/App.tsx), [../src/components/Navbar.tsx](../src/components/Navbar.tsx), [../src/components/POCLayout.tsx](../src/components/POCLayout.tsx).
- Backend API router (proxied `/api → 3001`): [../server/routes.ts](../server/routes.ts). Note the `beforeAll` readiness poll hits the server **root** (`localhost:3001/`), which is served by the static/SPA fallback in [../server/index.ts](../server/index.ts) — **not** this `/api` router.
