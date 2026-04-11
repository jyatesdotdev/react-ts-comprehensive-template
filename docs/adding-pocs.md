# Tutorial: Adding a New Proof of Concept (POC)

This guide explains how to add a new experiment or feature to the Research Lab. You can do this automatically using the CLI scaffolding or manually for full control.

## 1. The Easy Way (Automated Scaffolding)

The fastest way to start is using the built-in `create-poc` command.

```bash
# Basic UI POC
npm run create-poc "My New Feature"

# Specialized POC (webgl, websocket, webrtc, api, todo)
npm run create-poc "3D Experiment" webgl

# POC with automated backend module generation
npm run create-poc "Data Grid" api --backend
```

### What this does:
1.  **Generates Frontend Component**: Creates `src/pages/pocs/MyNewFeature.tsx` based on the selected template.
2.  **Registers Routing**: Updates `src/config/pocs.ts` to include your new POC, enabling lazy-loading and adding it to the Navbar.
3.  **Generates Backend (Optional)**: If `--backend` is used, creates `server/pocs/my-new-feature.ts` and mounts it in `server/routes.ts`.

---

## 2. The Manual Way (Full Control)

If you prefer to set things up yourself, follow these steps:

### Step A: Create the Component
Create a new file in `src/pages/pocs/MyExperiment.tsx`. We recommend wrapping your content in the `<POCLayout>` component for consistent navigation and styling.

```tsx
import React from 'react'
import POCLayout from '../../components/POCLayout'

export default function MyExperiment() {
  return (
    <POCLayout 
      title="My Experiment" 
      subtitle="Detailed description of what I am testing."
      badge="POC"
      badgeType="POC"
    >
      <div>
        {/* Your experimental code goes here */}
        <h2>Hello Research!</h2>
      </div>
    </POCLayout>
  )
}
```

### Step B: Register the POC
Open `src/config/pocs.ts` and perform two tasks:

1.  **Define the Lazy Load**:
    ```typescript
    const MyExperimentPOC = React.lazy(() => import('../pages/pocs/MyExperiment'))
    ```

2.  **Add to `POC_CONFIG`**:
    ```typescript
    {
      id: 'my-experiment',
      name: 'My Experiment',
      path: '/pocs/my-experiment',
      component: MyExperimentPOC,
      badge: 'POC',
      badgeType: 'POC',
      category: 'General', // Graphics, Network, State, Utility, or General
      description: 'A brief summary for the homepage card.'
    }
    ```

---

## Feature-Specific Templates

The scaffolding tool uses specialized templates found in `scripts/templates/frontend/`. You can reference these when building manually:

-   **WebGL**: Pre-configured Three.js environment with OrbitControls and cleanup logic.
-   **WebSocket**: Real-time messaging setup connecting to the Hono backend.
-   **WebRTC**: Local loopback peer-to-peer communication example.
-   **API**: Standard REST fetching pattern with loading and error states.
-   **Todo**: Complex state management example with backend persistence.

---

## Reference Links
-   [React Lazy Loading](https://react.dev/reference/react/lazy)
-   [React Router 7](https://reactrouter.com/home)
-   [Styled Components Documentation](https://styled-components.com/docs)
-   [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
