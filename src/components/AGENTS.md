# AGENTS.md — src/components

_Shared, reusable UI for the Research Lab: the global `Navbar` and the standard `POCLayout` page wrapper — this file guides agents editing this directory._

## Purpose
This directory holds cross-cutting chrome used by every POC page, not POC-specific experiment code (that lives in `src/pages/pocs/`). Both components read the single source of truth `src/config/pocs.ts` (`POC_CONFIG`) so the navbar dropdown and the in-page experiment switcher stay automatically in sync with the registry. `POCLayout` is the standard wrapper every POC page renders its content inside for consistent breadcrumb, switcher, backend-API link, and footer.

## Files
- `Navbar.tsx` — global top nav (default export `Navbar`). Renders Home / Tutorials links plus an "Experiments" dropdown that groups `POC_CONFIG` by `category` (falls back to `'General'`). Closes on outside `mousedown` and on item click.
- `POCLayout.tsx` — default export `POCLayout({ title, subtitle?, badge?, badgeType?, children, pocId? })`. The standard POC page shell: breadcrumb, experiment switcher (driven by `POC_CONFIG`), optional "Backend API" link (only when `pocId` is passed), "Copy Path" button, header/badge, white content card, footer.
- `Navbar.test.tsx` — Vitest + Testing Library unit test for `Navbar` (colocated). Wraps in `<MemoryRouter>`, opens/closes the dropdown, asserts a POC name renders. Note: it asserts the literal text `'Ralph Experiment'`, which comes from a `POC_CONFIG` entry — see Gotchas.

## Conventions & best practices
- **styled-components + Tailwind hybrid.** Static styles use the empty-template idiom: `styled.tag.attrs({ className: 'tailwind classes' })\`\``. Nothing goes in the backtick body except the rare real CSS (`POCLayout` uses `\`width: max-content; flex: none;\`` on breadcrumb parts). Match this idiom — do not write inline `className` on styled components or raw CSS-in-JS for layout.
- **Transient props (`$`-prefixed).** Dynamic/stateful styling is driven by props that must NOT reach the DOM: `$active`, `$type`, `$isOpen`. Declared via `styled(X).attrs<{ $active?: boolean }>((props) => ({ className: ... }))<{ $active?: boolean }>\`\`` — the generic is repeated on both `.attrs<>` and the final `<>`. Keep the `$` prefix; styled-components v6 forwards non-`$` custom props to the DOM.
- **React 19 / JSX.** `jsx: react-jsx` — no need to `import React` just for JSX. `POCLayout.tsx` imports `React` only for the `React.ReactNode` type usage (the `useState`/`useRef`/`useEffect` hooks are named imports, not `React.*`); keep imports that are actually referenced (strict `noUnusedLocals`).
- **TS strict.** `verbatimModuleSyntax` → use `import type` for type-only imports; `noUnusedParameters`; no enums/namespaces (`erasableSyntaxOnly`). `badgeType` is a string-literal union, not an enum.
- **Default exports** for both components (consumed by routing / lazy loading conventions elsewhere).
- **Outside-click pattern.** Both components register a `document.addEventListener('mousedown', ...)` in `useEffect` and remove it in cleanup — replicate exactly if you add another popover.

## Business rules & cross-file awareness
- **Registry-driven.** Both files import `POC_CONFIG` from `../config/pocs`. Never hardcode a POC list here — add/remove POCs in `src/config/pocs.ts`. `src/config/**` is EXCLUDED from coverage; these component files are NOT.
- **Badge color duplication.** The `badgeType → Tailwind classes` map (`WIP` yellow, `POC` blue, `STABLE` green, `Template` purple, fallback gray) exists in BOTH `Navbar.tsx` (`Badge`) and `POCLayout.tsx` (`Badge`). The color-by-`badgeType` logic is CONSISTENT between the two (including the `bg-gray-100 text-gray-600` fallback); only the badge sizing/padding differs — intentionally — (Navbar `px-1.5 py-0.5 text-[8px]` vs POCLayout `px-2 py-0.5 text-[10px]`). The map is still DUPLICATED across both files, so if you add a badge type, update the union in `src/config/pocs.ts` (`badgeType`) AND `POCLayout.tsx`'s `POCLayoutProps.badgeType` AND both `Badge` maps to keep the colors in sync.
- **Relative vs absolute URLs.** Frontend fetches relative paths (Vite proxies `/api`+`/ws` to `localhost:3001`). The ONE intentional exception lives here: `POCLayout` builds an ABSOLUTE `http://localhost:3001/api/pocs/${pocId}` for the external "Backend API" link button. Do not "fix" it to relative — an external `<a target="_blank">` needs the absolute origin.
- **`pocId` surfaces the backend link.** The "Backend API" button only renders when a POC page passes `pocId` to `POCLayout`. POC pages that have a `server/pocs/<id>.ts` route should pass it.
- **Routing lives elsewhere.** `src/App.tsx` maps `POC_CONFIG` into `<Route>`s under `<Suspense>`; this dir only renders links (`react-router-dom` `Link`/`useLocation`). Backend routes are registered in `server/routes.ts`.

## When you add or change files here
1. Prefer editing `src/config/pocs.ts` — changing the list, categories, or badges there flows into both components automatically; often no edit here is needed.
2. If you add a styled component, copy the `styled.tag.attrs({ className })\`\`` idiom and use `$`-prefixed transient props for any dynamic state.
3. If you change a `Badge` map or add a badge type, update BOTH `Navbar.tsx` and `POCLayout.tsx` maps plus the `badgeType` union in `src/config/pocs.ts` and `POCLayoutProps`.
4. If you change `POCLayoutProps`, update JSDoc on the prop and keep all consumers in `src/pages/pocs/*` compiling (TS strict).
5. Add/adjust a colocated `*.test.tsx` (Vitest, jsdom) and run `npm test` — coverage gate is 80% for lines/functions/branches/statements and these files count toward it.

## Gotchas
- `Navbar.test.tsx` asserts the hardcoded string `'Ralph Experiment'`. It is a real `POC_CONFIG` entry today; if that entry is renamed/removed the test breaks — update the assertion or pick a stable entry.
- The badge color map is duplicated (Navbar vs POCLayout) — editing one and forgetting the other ships inconsistent colors and no error will warn you. The color logic currently matches (both use the `bg-gray-100 text-gray-600` fallback); only the badge sizing/padding differs intentionally, so keep the two color maps in sync when you add a type.
- Don't drop the `$` prefix on `$active`/`$type`/`$isOpen`; without it styled-components v6 forwards the prop and React warns about an unknown DOM attribute.
- `POCLayout`'s Backend API URL is absolute-by-design; leave `http://localhost:3001` as-is here even though components elsewhere must use relative `/api/...`.
- Both dropdowns manage open state in React and also set `display`/`pointer-events` via classes; keep the outside-click `useEffect` cleanup or you leak listeners.

## Related
- Parent: [../AGENTS.md](../AGENTS.md)
- Root: [/AGENTS.md](../../AGENTS.md)
- Registry (single source of truth): [../config/pocs.ts](../config/pocs.ts)
- Routing consumer: [../App.tsx](../App.tsx)
- Backend router: [../../server/routes.ts](../../server/routes.ts)
