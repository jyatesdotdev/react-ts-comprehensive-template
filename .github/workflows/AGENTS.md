# AGENTS.md — .github/workflows

_GitHub Actions workflow definitions for CI gates and security scanning; this file guides agents editing the YAML in this directory._

## Purpose
These two workflows are the automated quality gates that run on every push and PR to `main`. `ci.yml` enforces code health (lint, typecheck, unit tests + coverage, E2E). `security.yml` runs dependency and vulnerability scanning. The thresholds themselves (e.g. the 80% coverage gate) live in project config files at the repo root, not in these YAMLs — these workflows only invoke the commands.

## Files
- `ci.yml` — workflow `CI`. Triggers on `push` and `pull_request` to `main`. Three independent parallel jobs (no `needs`), all `runs-on: ubuntu-latest`, all using `actions/checkout@v4` + `actions/setup-node@v4` (Node 20, `cache: npm`) then `npm ci`:
  - `lint-and-typecheck` — `npx eslint .` then `npx tsc -b`. `tsc -b` (build mode) is a **real** typecheck across all referenced projects (`src`, the Vite/`node` config, **and now `server`**); the previous `npx tsc --noEmit` was a no-op because the root `tsconfig.json` has `files: []` + `references` only, and project references are ignored outside build mode, so it compiled zero files.
  - `test` — `npx vitest run --coverage` (coverage thresholds enforced by `vitest.config.ts`, not here).
  - `e2e` — `npx playwright install --with-deps chromium` then `npx playwright test`.
- `security.yml` — workflow `Security`. Triggers on `push`/`pull_request` to `main` **and** a weekly `schedule` (`cron: '0 6 * * 1'` = Mondays 06:00 UTC). Top-level `permissions: security-events: write, contents: read`. Three jobs:
  - `dependency-audit` — Node 20 (`cache: npm`), `npm ci`, then `npm audit --audit-level=high` (`continue-on-error: true`, report-only) and `npm audit --audit-level=critical` (fails the job on critical vulns only).
  - `trivy` — `aquasecurity/trivy-action@master` filesystem scan (`scan-type: fs`, `scan-ref: '.'`) emitting `trivy-results.sarif`, uploaded via `github/codeql-action/upload-sarif@v3` with `if: always()`.
  - `codeql` — job-level `security-events: write`; `github/codeql-action/init@v3` (`languages: javascript-typescript`) then `analyze@v3`.

## Conventions & best practices
- Pin actions the way the existing files do: reusable `actions/*` and `github/codeql-action/*` are pinned to `@v4`/`@v3`; only `aquasecurity/trivy-action` uses `@master`. Match the surrounding style when adding steps.
- Node is `20` everywhere. Keep it consistent across jobs and both files.
- Every step that runs project scripts uses `npx <tool>` directly (e.g. `npx eslint .`, `npx vitest run --coverage`) rather than `npm run <script>`. This bypasses the `package.json` script aliases — if you change a script's flags in `package.json`, update the matching `npx` invocation here too (they can drift).
- CI jobs are intentionally independent/parallel for speed. Only add `needs:` if you truly require ordering.
- Keep `permissions` least-privilege: `security.yml` grants `security-events: write` (needed for SARIF upload) and `contents: read` — do not widen without cause.
- SARIF-uploading steps use `if: always()` so results post even when the scan finds issues; preserve that on any new scanner.

## Business rules & cross-file awareness
- **Coverage gate lives elsewhere.** `ci.yml`'s `test` job just runs `npx vitest run --coverage`; the 80% lines/functions/branches/statements threshold and the `src/config/**` coverage exclusion are defined in `../../vitest.config.ts`. Changing the number here does nothing — edit `vitest.config.ts`.
- **E2E needs the app running.** `ci.yml` does not start a server; `../../playwright.config.ts` `webServer` boots `npm run dev` (frontend Vite on port 5180, which proxies `/api` + `/ws` to the Hono backend on 3001). E2E `baseURL` is `http://localhost:5180`. If a POC's E2E test hits the backend, it must be reachable through that dev flow.
- **Lint scope.** `npx eslint .` respects `../../eslint.config.js`, whose `globalIgnores(['dist', 'scripts/templates'])` excludes the `scripts/templates` directory — those placeholder-token template files are not standalone-valid TS and must stay ignored.
- **npm everywhere.** Both workflows use **npm** against the committed `package-lock.json` (`ci.yml` and `security.yml`'s `dependency-audit` both run `npm ci`). Keep new jobs on npm; don't reintroduce pnpm.

## When you add or change files here
Adding a new CI job (the most common change):
1. Add a job under `jobs:` in the relevant workflow, `runs-on: ubuntu-latest`.
2. Start with `- uses: actions/checkout@v4` then `- uses: actions/setup-node@v4` with `node-version: 20` and `cache: npm`.
3. Install deps with `- run: npm ci` (both workflows use npm).
4. Add the actual command as a named step using `npx <tool>` to mirror the existing pattern.
5. If it produces SARIF, upload it with `github/codeql-action/upload-sarif@v3` and `if: always()`, and confirm `security-events: write` is granted (top-level or job-level).
6. Do not `cd` into subdirs; jobs run from repo root.

## Gotchas
- `npm audit --audit-level=high` is `continue-on-error: true` (advisory only); the **critical** step is the actual gate. Don't assume high-severity advisories fail the build.
- `trivy-action@master` is unpinned and can change behavior without a version bump.
- Coverage/lint/type failures fail `ci.yml`, blocking the PR — verify locally with `npm run lint`, `npx tsc -b`, and `npx vitest run --coverage` before pushing.

## Related
- Root guide: [../../AGENTS.md](../../AGENTS.md)
- Gate config: [../../vitest.config.ts](../../vitest.config.ts), [../../playwright.config.ts](../../playwright.config.ts), [../../eslint.config.js](../../eslint.config.js), [../../package.json](../../package.json)
