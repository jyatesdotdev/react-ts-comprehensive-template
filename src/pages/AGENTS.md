# AGENTS.md — src/pages

_The top-level (non-POC) route pages of the app — `Home` and `Tutorials` — plus their Vitest unit tests. This file guides agents editing anything in this directory._

## Purpose
`src/pages/` holds the two first-class route pages that are NOT experiments: `Home` (the "/" landing/dashboard that lists every POC) and `Tutorials` ("/tutorials", the in-app docs). They are statically imported and routed in `src/App.tsx` (unlike POC pages, which live in `src/pages/pocs/` and are `React.lazy`-loaded from `src/config/pocs.ts`). `Home` is the primary consumer of the `POC_CONFIG` registry — it reads it to render the experiment grid and category filter.

## Files
- `Home.tsx` — default-exported `Home()` component; the "/" route. Reads `POC_CONFIG` from `../config/pocs`, derives the category list, renders a category-filter button bar (`useState('All')`) and a grid of `<POCCard>` links, plus static "stack / templates / scaffolding" sections and two hardcoded blueprint cards (`/pocs/webgl-template`, `/pocs/template`).
- `Home.test.tsx` — Vitest test for `Home`. Renders inside `<MemoryRouter>` (required because `Home` uses `<Link>`), asserts the subtitle renders, then clicks the `Graphics` filter button and expects `Ralph Experiment` to be visible. **Data-coupled to `POC_CONFIG`.**
- `Tutorials.tsx` — default-exported `Tutorials()` component; the "/tutorials" route. A sidebar + main-content docs page driven by a `useState<TutorialTab>` and a `switch` in `renderContent()`. `TutorialTab` is a string-literal union of 9 tabs (`overview | adding-pocs | backend | testing | webgl | websocket | webrtc | api | todo`).
- `Tutorials.test.tsx` — Vitest test for `Tutorials`. Renders inside `<MemoryRouter>` (uses `<Link to="/">`), asserts the overview default (its `Research Lab Tutorials` heading), then `it.each` clicks the *other 8* sidebar tabs and asserts each heading — Overview is NOT an `it.each` row, it is covered by the default-render test. Adding a new tab therefore needs a new `it.each` row (or its own default coverage). **Coupled to sidebar button labels + heading text in `Tutorials.tsx`.**

## Conventions & best practices
- **Styling is hybrid styled-components + Tailwind.** Static styles use the house idiom `styled.tag.attrs({ className: 'tailwind classes' })\`\`` (empty template literal). Match this exactly — do not write raw CSS in the template.
- **Dynamic styles use `.attrs(props => ({ className: ... }))`.** Note the divergence between the two files: `Tutorials.tsx` `SidebarItem` uses a proper **transient prop `$active`** (correct house style — `$`-prefixed so it is not forwarded to the DOM). `Home.tsx` `Badge` instead uses a plain `type` prop (`styled.span.attrs<{ type?: string }>`). Prefer `$`-prefixed transient props for any NEW stateful style prop you add.
- **`Home.tsx`'s `Badge` duplicates the badgeType→Tailwind color map** (WIP/POC/STABLE/Template → yellow/blue/green/purple, else gray). This map also exists in `src/components/Navbar.tsx` and `src/components/POCLayout.tsx`. If you add a badge type, update ALL THREE consistently.
- **Default exports required.** Both pages `export default`; `src/App.tsx` imports them by default. Keep the default export.
- **These pages are NOT wrapped in `<POCLayout>`.** `POCLayout` chrome (breadcrumb, experiment switcher, backend link) is for POC pages only — do not add it here.
- **React 19 / `jsx: react-jsx`:** JSX needs no `import React`. `Home.tsx` imports `React` only because it calls `React.useState`; `Tutorials.tsx` imports `useState` directly — either is fine.
- **TS strict:** `noUnusedLocals`/`noUnusedParameters`, `verbatimModuleSyntax` (use `import type` for type-only imports), `erasableSyntaxOnly` (no enums/namespaces — `TutorialTab` is a string-literal union, keep that pattern; use `as const` if you need a value list).
- **Tests:** Vitest with globals + jsdom; `@testing-library/jest-dom` matchers come from `src/setupTests.ts` (no per-file import). Wrap any component using `<Link>`/router hooks in `<MemoryRouter>`. Query by role/text as the existing tests do.

## Business rules & cross-file awareness
- **`Home.tsx` consumes `src/config/pocs.ts` (the single source of truth for POCs).** Adding/removing/renaming a POC there changes the Home grid automatically — and can BREAK `Home.test.tsx`, which hardcodes the `Graphics` category and the POC named `Ralph Experiment`. If you edit `POC_CONFIG`, re-check that test.
- **`Tutorials.test.tsx` is tightly coupled to `Tutorials.tsx`.** Its `it.each` table lists exact sidebar button labels (e.g. `State & Persistence`) and their heading text (e.g. `Todo (State Management)`). Renaming a tab label, changing a heading, or adding/removing a `case` requires updating this test in lockstep.
- **Routing lives in `src/App.tsx`:** `<Route path="/" element={<Home />} />` and `<Route path="/tutorials" element={<Tutorials />} />`. Changing a page's route path here means updating any `<Link>`/navbar targets that point to it.
- **Code samples inside `Tutorials.tsx` are documentation strings, not executable code.** They describe scaffolding (`npm run create-poc`), dual registration, and Three.js disposal for the wider repo. If repo conventions change (ports, script names, the `pocs.ts`/`routes.ts` registration flow), update these narrative snippets so the docs stay accurate.
- **Coverage gate is 80%** (lines/functions/branches/statements). `src/config/**` is excluded from coverage, but `src/pages/**` is NOT — new branches in these pages need test coverage or CI fails.

## When you add or change files here
1. Edit the page component, following the `styled.tag.attrs({ className })` idiom and keeping the `export default`.
2. If you add a new stateful style prop, prefix it `$` (transient) like `SidebarItem`'s `$active`.
3. If you touched user-facing text that a test asserts on (subtitles, sidebar labels, headings, badge/category values), update the colocated `*.test.tsx` accordingly.
4. Add/adjust tests to cover new branches (filter states, new `switch` cases) so coverage stays ≥ 80%. Wrap router-dependent renders in `<MemoryRouter>`.
5. If you add a brand-new top-level page, register it in `src/App.tsx` with a `<Route>` and link to it from the navbar/pages as needed (top-level pages are NOT added to `POC_CONFIG`).
6. Run `npm run test` and `npm run lint` before finishing.

## Gotchas
- `Home.test.tsx` will fail if `POC_CONFIG` no longer contains a `Graphics`-category POC named exactly `Ralph Experiment` — this is real data coupling, not a bug in the test.
- `Home.tsx`'s `Badge` uses `type` (not `$type`), so it works only because the values passed are `badgeType` strings; do not assume the transient-prop rule is applied uniformly across this dir.
- Don't wrap these pages in `<POCLayout>` or add them to `POC_CONFIG` — they are top-level routes, not experiments.
- `Tutorials.tsx`'s `switch` has a `default: return null`; if you add a tab to `TutorialTab`, add its `case` (and a sidebar `SidebarItem`) or the tab renders blank.
- The two hardcoded blueprint cards in `Home.tsx` point at `/pocs/webgl-template` and `/pocs/template`; those routes must exist in `POC_CONFIG` or the links 404.

## Related
- Parent: [../AGENTS.md](../AGENTS.md)
- Root: [../../AGENTS.md](../../AGENTS.md)
- POC registry (single source of truth): [../config/pocs.ts](../config/pocs.ts)
- Shared POC chrome + duplicated badge map: [../components/POCLayout.tsx](../components/POCLayout.tsx)
- Backend API router (referenced by the Tutorials docs): [../../server/routes.ts](../../server/routes.ts)
