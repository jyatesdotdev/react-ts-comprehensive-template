# AGENTS.md — scripts/templates/frontend

_React component templates (one per POC type) consumed by the `create-poc` scaffolder; this file guides agents editing this directory._

## Purpose
These `.tsx` files are the source blueprints the scaffolder (`scripts/create-poc.mjs`) copies into `src/pages/pocs/<Component>.tsx` when you run `npm run create-poc "<Name>" <type>`. One file per POC type (`basic`, `api`, `todo`, `webgl`, `webrtc`, `websocket`). They are placeholder-token stencils, NOT standalone-valid modules — they are ESLint-ignored (`globalIgnores` in `eslint.config.js`) and never typechecked in place; validity is only enforced once scaffolded into `src/pages/pocs/`. Every template wraps its UI in `<POCLayout>` for consistent lab chrome.

## Files
- `basic.tsx` — minimal centered-`Card` UI stencil, no state, no backend. Uses ALL four tokens: `__NAME__`, `__COMPONENT_NAME__`, `__ID__`, `__FILE_NAME__`. Default export `__COMPONENT_NAME__POC`. Scaffolder category → `General`.
- `api.tsx` — REST-fetch stencil: `useEffect` GETs `/api/pocs/__ID__` (relative), with loading/error/data states and a Refresh button. Tokens `__NAME__`, `__COMPONENT_NAME__`, `__ID__` (no `__FILE_NAME__`). Uses `useState<any>`. Always gets a backend module. Category → `Network`.
- `todo.tsx` — full-stack CRUD stencil: GET/POST plus `PATCH .../:id/toggle` and `DELETE .../:id` against `/api/pocs/__ID__`; re-fetches after each mutation ("Optimistic-Lite"). Imports `React` (optional — its `React.FormEvent` is a type-only use, cf. `websocket.tsx` which omits the import). Tokens `__NAME__`, `__COMPONENT_NAME__`, `__ID__`. Always gets a backend module. Category → `State`.
- `webgl.tsx` — Three.js scene stencil (OrbitControls, lighting, grid, animation loop, full disposal cleanup). NO placeholder tokens — hardcoded `export default function WebGLTemplate()`, `pocId="webgl-template"`, `title="WebGL Template"`, `badgeType="Template"`. Renamed by literal-string replacement in the scaffolder. Category → `Graphics`.
- `webrtc.tsx` — WebRTC loopback stencil (two local `RTCPeerConnection`s, `getUserMedia`, STUN config), cleanup stops tracks/closes peers on unmount. NO tokens — hardcoded `export default function WebRTCPOC()`, `pocId="webrtc"`. No backend (loopback is local). Category → `Network`.
- `websocket.tsx` — WebSocket echo-client stencil connecting to `` `${protocol}//${window.location.host}/ws` `` via the Vite proxy. NO tokens — hardcoded `export default function WebSocketPOC()`, `pocId="websocket"`. Always gets a backend module. Category → `Network`.

## Conventions & best practices
- **Default export one component** — React.lazy in `src/config/pocs.ts` requires a default export. `basic`/`api`/`todo` name it `__COMPONENT_NAME__POC`; `webgl`/`webrtc`/`websocket` use fixed names the scaffolder rewrites.
- **Always wrap in `<POCLayout title subtitle badge badgeType pocId>`**, imported from `'../../components/POCLayout'`. That relative path is correct because the generated file lands in `src/pages/pocs/` — do NOT "fix" it to this folder's depth. Pass `pocId` so the backend-API link button appears.
- **Static styling** — `styled.tag.attrs({ className: '<tailwind>' })\`\`` (empty template literal). Each styled component carries a house-style comment explaining what the key classes do; keep that pattern.
- **Dynamic styling** — declare the prop type twice: `styled.tag.attrs<{ prop }>({ className: (props) => \`...\` })<{ prop }>\`\``. Existing templates use plain prop names (`completed`, `variant`, `connected`). Repo-wide convention prefers `$`-prefixed transient props (`$active`, `$type`) so they are not forwarded to the DOM — prefer `$` for any new dynamic prop you add.
- **Fetch RELATIVE paths only** (`/api/pocs/__ID__`, `/ws`). Never hardcode `http://localhost:3001`; Vite proxies `/api` and `/ws` to the Hono backend.
- **tsconfig flags** (all in `tsconfig.app.json`) apply to the GENERATED file — but `strict` is OFF (no `strictNullChecks`/`noImplicitAny`, so null bugs are NOT caught here). `verbatimModuleSyntax: true` forces `import type` for type-only imports; `erasableSyntaxOnly: true` bans enums/namespaces/param-properties. `jsx: react-jsx` means no React import is needed except for the `React` namespace — and even then only in VALUE positions: a type-position `React.FormEvent` resolves via @types/react's UMD global, so both `todo.tsx` (imports `React`) and `websocket.tsx` (does NOT import it) use `React.FormEvent` and compile cleanly.
- **Three.js lifecycle** (match `webgl.tsx`): build scene/camera/renderer in `useEffect`; the cleanup MUST `renderer.dispose()`, `geometry.dispose()`, `material.dispose()`, `controls.dispose()`, `cancelAnimationFrame`, `removeEventListener('resize', …)`, and `removeChild(renderer.domElement)`. Cap `setPixelRatio(Math.min(devicePixelRatio, 2))`.

## Business rules & cross-file awareness
- **Consumer:** `scripts/create-poc.mjs`. `type` = this file's name minus `.tsx`; an unknown type falls back to `basic.tsx`.
- **Token substitution** (global replace): `__NAME__`→display name, `__COMPONENT_NAME__`→PascalCase, `__ID__`→kebab id, `__FILE_NAME__`→`<Component>.tsx`. Only `basic`/`api`/`todo` actually contain these tokens.
- **Legacy literal-string rename** for the token-less templates — the scaffolder edits exact strings, so they must stay intact: `webgl` matches `export default function WebGLTemplate()`, `title="WebGL Template"`, its exact subtitle, `pocId="webgl-template"`, and `WebGLTemplate.tsx`; `websocket`/`webrtc` match `pocId="websocket"` / `pocId="webrtc"` and the first `title="..."`. (The `else if` branch at `create-poc.mjs:72` actually fires for `websocket`/`api`/`todo`/`webrtc`, but on the token-based `api`/`todo` it's a harmless no-op — their literals were already substituted by lines 58–62, so the name/pocId patterns miss and the `title` rewrite re-sets the same value.) Reformatting these breaks the rename silently.
- **Auto-registration (frontend):** after copy the scaffolder inserts a `React.lazy(...)` import and a `POC_CONFIG` entry into `src/config/pocs.ts`, mapping category by type (`webgl`→Graphics; `websocket`/`webrtc`/`api`→Network; `todo`→State; else General). It anchors on the literal `export const POC_CONFIG: POCMetadata[] = [` and the last `React.lazy(...)` line.
- **Auto-registration (backend):** for `todo`/`api`/`websocket` (always) or `--backend`, it copies a `scripts/templates/backend/*.ts` module and edits `server/routes.ts`. So the `api`/`todo`/`websocket` fetch stencils assume a matching `server/pocs/<id>.ts` exists.
- **Badge types:** templates only SET `badge`/`badgeType` (`POC` or `Template`). The badgeType→Tailwind color map is DUPLICATED in `src/components/Navbar.tsx` and `src/components/POCLayout.tsx`; introducing a new badgeType means updating both.

## When you add or change files here
1. Create `<type>.tsx`; default-export one component wrapped in `<POCLayout … pocId>`.
2. **Prefer placeholder tokens** (`__NAME__`, `__COMPONENT_NAME__`, `__ID__`, `__FILE_NAME__`) so no legacy string-replace is needed. If you must hardcode names, add a matching literal-replacement block in `scripts/create-poc.mjs`.
3. Add the type→category entry in the scaffolder's `categoryMap` (else it defaults to General).
4. If it needs an API, ensure a backend stencil exists in `../backend` and either add the type to the always-backend list or rely on `--backend`.
5. Keep fetches relative; static styles as `.attrs({className})`, dynamic as typed `.attrs<{…}>`.
6. Validate by scaffolding, not by linting this file: `npm run create-poc "Test Name" <type>`, then `npm run build` (`tsc -b`) + `npm run lint` on the GENERATED `src/pages/pocs/*.tsx`.

## Gotchas
- **`webgl.tsx` has a real bug:** it calls `useState` but imports only `{ useEffect, useRef }` from `react`. A scaffolded WebGL POC will FAIL `tsc -b` until `useState` is added to the import — fix the template (or the generated file).
- **Token-less exports aren't fully renamed:** the scaffolder builds `WebsocketPOC`/`WebrtcPOC`, which don't match the actual `WebSocketPOC` / `WebRTCPOC` spellings, so those function names stay unchanged. Harmless (default export) but the name won't reflect the POC.
- **Tokens are exact and case-sensitive** (`__NAME__`, `__COMPONENT_NAME__`, `__ID__`, `__FILE_NAME__`). A typo ships un-substituted text into the generated file.
- **`api.tsx` on-screen labels (`GET /api/hello`, `vite.config.ts`) are decorative** — the real request is `fetch('/api/pocs/__ID__')`. Don't treat the label as the route.
- **These files are ESLint-ignored and never typechecked here**, so loose typing (`useState<any>`) and placeholder tokens won't error until scaffolded — always verify via `build`, not `lint` of the template.

## Related
- Parent: [../AGENTS.md](../AGENTS.md) · Root: [../../../AGENTS.md](../../../AGENTS.md)
- Sibling backend stencils: [../backend/AGENTS.md](../backend/AGENTS.md)
- Scaffolder: [`../../create-poc.mjs`](../../create-poc.mjs)
- Registries this dir feeds: [`../../../src/config/pocs.ts`](../../../src/config/pocs.ts), [`../../../server/routes.ts`](../../../server/routes.ts)
- Chrome wrapper every template uses: [`../../../src/components/POCLayout.tsx`](../../../src/components/POCLayout.tsx)
