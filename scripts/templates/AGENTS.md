# AGENTS.md — scripts/templates

_Template SOURCES that `npm run create-poc` copies + token-substitutes to scaffold a new POC; this file guides agents editing these templates._

## Purpose
This directory holds the raw source files the scaffolder (`../create-poc.mjs`, run via `npm run create-poc`) copies to bootstrap a POC. `frontend/*.tsx` become `src/pages/pocs/<ComponentName>.tsx`; `backend/*.ts` become `server/pocs/<id>.ts`. These files are **ESLint-ignored** (`globalIgnores(['dist','scripts/templates'])` in `eslint.config.js`) and are intentionally **not standalone-valid TS** — placeholder tokens and deliberate gaps make sense only after substitution. Never lint, typecheck, or execute them directly.

## Files
`frontend/` (React page templates → `src/pages/pocs/`):
- `basic.tsx` — token style. Centered `styled.div` Card wrapped in `<POCLayout>`; UI-only starter. Uses `__NAME__`/`__COMPONENT_NAME__`/`__ID__`/`__FILE_NAME__`.
- `api.tsx` — token style. `fetch('/api/pocs/__ID__')` (GET) via the Vite proxy, renders the JSON response with refresh button.
- `todo.tsx` — token style. Full CRUD against `/api/pocs/__ID__` (GET, POST, PATCH `:id/toggle`, DELETE `:id`) using a re-fetch-after-mutate pattern.
- `webgl.tsx` — **legacy string-replace style (NO tokens)**. Three.js scene with OrbitControls; hardcoded `export default function WebGLTemplate()`, `title="WebGL Template"`, `pocId="webgl-template"`.
- `websocket.tsx` — **legacy string-replace**. Hardcoded `WebSocketPOC`, `pocId="websocket"`; connects to `/ws` via proxy (the global echo server).
- `webrtc.tsx` — **legacy string-replace**. Hardcoded `WebRTCPOC`, `pocId="webrtc"`; two loopback `RTCPeerConnection`s.

`backend/` (Hono module templates → `server/pocs/`):
- `basic.ts` — token style. `const __BINDING__ = new Hono()` with a single `GET '/'`; `export default __BINDING__`. Used for `--backend`, `api`, and `websocket` types.
- `todo.ts` — token style. In-memory `let items = [...]`; GET/POST/PATCH-toggle/DELETE. Used for the `todo` type.

## Conventions & best practices
- **Two substitution mechanisms coexist — know which a file uses:**
  1. **Token files** (`basic.tsx`, `api.tsx`, `todo.tsx`, `basic.ts`, `todo.ts`): scaffolder does global `replace(/__TOKEN__/g, …)`. Frontend replaces all four tokens; **backend replaces `__NAME__`, `__BINDING__` (camelCase id — the Hono const + default export), and `__ID__` (kebab id — used in path strings/comments)**, substituting `__BINDING__` before `__ID__`. Prefer this style for new templates.
  2. **Legacy string-replace files** (`webgl.tsx`, `websocket.tsx`, `webrtc.tsx`): no tokens — the scaffolder rewrites literal anchor strings. For `webgl.tsx` it replaces `export default function WebGLTemplate()`, `title="WebGL Template"`, the subtitle, `pocId="webgl-template"`, and `WebGLTemplate.tsx` (all work). For `websocket.tsx`/`webrtc.tsx` only `pocId="<type>"` and `title="…"` are rewritten; the **default-export function name is left unchanged** — the rename regex is built from a naively-capitalized `type` (`WebsocketPOC`/`WebrtcPOC`) that never matches the files' actual `WebSocketPOC`/`WebRTCPOC` (irregular internal caps), so it always silently no-ops. That's intentionally harmless: `config/pocs.ts` loads the default export by path via `React.lazy`, so the exported function name is never referenced.
- Every frontend template **default-exports** its component (required by `React.lazy`) and wraps content in `<POCLayout title subtitle badge badgeType pocId>` (pass `pocId` to surface the backend-API link button).
- **Styling = Tailwind through styled-components:** static blocks use `styled.tag.attrs({ className: '…' })` + empty template `` `` ``; dynamic blocks use `styled.tag.attrs<{ prop }>({ className: (props) => \`…${props.prop}…\` })<{ prop }>` `` `` ``.
- **Fetch RELATIVE paths only** (`/api/pocs/__ID__`, `/ws`). Never hardcode `http://localhost:3001` — Vite proxies `/api` and `/ws` to the Hono backend on `:3001`.
- **Three.js (`webgl.tsx`):** create scene/camera/renderer inside `useEffect`; the cleanup MUST dispose geometry, material, renderer, controls, `cancelAnimationFrame`, remove the resize listener, and remove the canvas. `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`.
- **Backend modules** export `new Hono()`; routes are relative to the mount point (`api.route('/pocs/<id>', …)`); state is in-memory only (`let items`) and resets on restart.
- The **generated** output must satisfy the enabled tsconfig flags — `noUnusedLocals`/`noUnusedParameters`, `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly` (no enums/namespaces), `noFallthroughCasesInSwitch` — so keep template code within those rules even though the templates themselves aren't linted. Note `strict` is **NOT** enabled in any tsconfig, so strict null-checking is not enforced; don't assume it.

## Business rules & cross-file awareness
- The scaffolder auto-edits two registries by string/regex match — keep their anchors intact when generating output:
  - `../../src/config/pocs.ts`: inserts a `React.lazy(...)` import after the **last** `React.lazy(...)` line and a `POC_CONFIG` entry right after the literal `export const POC_CONFIG: POCMetadata[] = [`.
  - `../../server/routes.ts`: inserts an `import <camelId> from './pocs/<id>'` after the last such import and an `api.route('/pocs/<id>', <camelId>)` after the last route.
- **Backend generation triggers** when `--backend`/`-b` is passed OR `type` is `todo`, `api`, or `websocket`. `todo` → `backend/todo.ts`; everything else → `backend/basic.ts`. (A `websocket` POC therefore gets a REST stub it doesn't use — the real socket is the global `/ws` echo in `server/index.ts`.)
- **Category map** lives in the scaffolder: `webgl→Graphics`, `websocket|webrtc|api→Network`, `todo→State`, else `General`. Add new types there for correct navbar grouping.
- Badge color logic (mapping `badgeType`) is duplicated in `Navbar.tsx` and `POCLayout.tsx`; if a template introduces a new `badgeType`, both must be updated (not a change to this dir, but the generated POC will render wrong otherwise).

## When you add or change files here
1. Create `frontend/<type>.tsx` (and optionally `backend/<type>.ts`). Use **token style** (`__NAME__`, `__COMPONENT_NAME__`, `__ID__`, `__FILE_NAME__`; backend also has `__BINDING__` — camelCase id for the Hono const/default export).
2. Wrap the component in `<POCLayout …>`, keep a `export default`, and use only relative `/api`/`/ws` fetch paths with `pocId="__ID__"`.
3. In `../create-poc.mjs`: add `<type>` to the usage list, the `categoryMap`, and (for auto backend) the `type === 'todo' || 'api' || 'websocket'` condition if desired.
4. Verify end-to-end: `npm run create-poc "Test Name" <type> [--backend]`, then confirm `src/pages/pocs/`, `src/config/pocs.ts`, `server/pocs/`, and `server/routes.ts` were updated and the POC loads at `/pocs/<id>`.
5. Do **not** add these files to lint/typecheck — they must stay in `globalIgnores`.

## Gotchas
- Editing the anchor strings in `webgl.tsx`/`websocket.tsx`/`webrtc.tsx` silently breaks scaffolding (the `.replace()` no longer matches). For `webgl.tsx` the generated component then keeps `WebGLTemplate`; for `websocket.tsx`/`webrtc.tsx` only the `pocId`/`title` rewrites are at stake — their `WebSocketPOC`/`WebRTCPOC` function name is never renamed anyway (see Conventions), which is harmless.
- Templates are intentionally invalid standalone: `webgl.tsx` uses `useState` without importing it, and tokens like `__COMPONENT_NAME__` aren't valid identifiers. Running `tsc`/`eslint` on this dir is meaningless (and it's ignored anyway).
- Backend templates use a dedicated **`__BINDING__`** token (camelCase id, e.g. `myPoc`) for the Hono const and default export — `const __BINDING__ = new Hono()` … `export default __BINDING__` — while **`__ID__`** (kebab id) appears only in strings/comments (the mount comment `/api/pocs/__ID__`, the `poc: "__ID__"` field). This keeps multi-word POCs valid: `"My Multiword POC"` now generates `const myMultiwordPoc = new Hono()` (not the invalid `const my-multiword-poc = new Hono()`). `create-poc.mjs` computes `camelId` right after `id` and substitutes `__BINDING__` before `__ID__`.
- Dynamic `styled` blocks here pass **non-transient** props (`connected`, `variant`, `completed`) into `.attrs`; the repo's broader house style prefers `$`-prefixed transient props to avoid forwarding them to the DOM.
- The scaffolder's success log prints `http://localhost:5173/...`, but the Vite dev server is configured on **:5180** (strictPort, `vite.config.ts`).
- `../create-poc.mjs.bak` is a stale backup and is not used by `npm run create-poc`.

## Related
- Scaffolder: [../create-poc.mjs](../create-poc.mjs) — the sole consumer of these templates.
- Parent: [../AGENTS.md](../AGENTS.md) · Root: [../../AGENTS.md](../../AGENTS.md)
- Registries the scaffolder edits: [../../src/config/pocs.ts](../../src/config/pocs.ts) ([AGENTS.md](../../src/config/AGENTS.md)) and [../../server/routes.ts](../../server/routes.ts)
- Chrome wrapper every template imports: [../../src/components/POCLayout.tsx](../../src/components/POCLayout.tsx) ([AGENTS.md](../../src/components/AGENTS.md))
