# React + TypeScript Research Template

A modern, extensible template for rapid prototyping and technical Proof of Concepts (POCs).

## Features

- **React 19** with TypeScript
- **Vite 8** + **Tailwind CSS 4**
- **Hono** POC Server (modern Express equivalent)
- **WebSockets** enabled for real-time experiments
- **Three.js** integrated for WebGL graphics
- **Styled Components** for scoped, dynamic styling
- **React Router 7** for navigation

## Documentation

For a detailed look at the project's design philosophy and technical setup, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Project Structure

```text
react-ts-template/
├── e2e/                # Playwright end-to-end tests & screenshots
├── scripts/            # Automation scripts & POC templates
├── server/             # Hono backend source code
│   └── pocs/           # Backend modules for specific experiments
├── src/                # React frontend source code
│   ├── components/     # Shared UI components
│   ├── config/         # Central POC registration & metadata
│   └── pages/          # Individual POC page components
└── playwright.config.ts # E2E test configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development environment (Frontend + Backend):
   ```bash
   npm run dev
   ```

- Frontend: [http://localhost:5180](http://localhost:5180)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)
- WebSocket: `ws://localhost:3001/ws` (proxied via `/ws`)

## How to add a new POC

Adding a new feature or research experiment is now automated:

### The Easy Way (Automated)
Run the following command to generate a new POC with both a frontend component and a backend module, and automatically register them:

```bash
# Create a basic POC
npm run create-poc "My New Feature"

# Create a WebGL-based POC
npm run create-poc "New Graphics Exp" webgl
```

This command will:
1.  Create `src/pages/pocs/MyNewFeature.tsx` (using the basic or WebGL template).
2.  Register the POC in `src/config/pocs.ts` (with auto-import and routing).
3.  Create a backend module in `server/pocs/my-new-feature.ts`.
4.  Register the backend route in `server/routes.ts`.

### The Manual Way (Customizing)

#### 1. Frontend Component
- **Standard**: Copy `src/pages/pocs/Template.tsx` to a new file in `src/pages/pocs/`.
- **WebGL**: Copy `src/pages/pocs/WebGLTemplate.tsx` for a pre-configured Three.js environment.

#### 2. Register the POC
Add your new POC to the `POC_CONFIG` array in `src/config/pocs.ts`. Assign a `category` (`Graphics`, `Network`, `State`, `Utility`) to automatically group it in the Navbar's "Experiments" dropdown.

```typescript
const MyNewFeaturePOC = React.lazy(() => import('../pages/pocs/MyNewFeature'))

export const POC_CONFIG: POCMetadata[] = [
  {
    id: 'my-feature',
    name: 'My Feature',
    path: '/pocs/my-feature',
    component: MyNewFeaturePOC,
    badge: 'WIP',
    badgeType: 'WIP',
    category: 'Graphics', // Groups in Navbar
    description: 'Description of my cool new feature.'
  }
]
```

#### 3. Backend (Hono)
To add a dedicated backend module manually:
1. Create a file in `server/pocs/` (e.g., `my-poc.ts`).
2. Export a Hono instance from it.
3. Register it in `server/routes.ts`:
   ```typescript
   import myPoc from './pocs/my-poc'
   api.route('/pocs/my-poc', myPoc)
   ```
   The routes will be available at `http://localhost:3001/api/pocs/my-poc`.


## Tech Stack Decisions

- **Hono**: Chosen for its incredible speed and modern API, providing a lightweight alternative to Express that works seamlessly with Vite.
- **Tailwind 4**: Leveraging the new Vite-native plugin for the fastest possible build times and simplified configuration.
- **Three.js**: The industry standard for 3D on the web, pre-configured for React lifecycle management.
