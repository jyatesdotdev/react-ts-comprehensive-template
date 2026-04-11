# Tutorial: Backend Integration (Hono Server)

This guide covers how to extend the Hono backend server to support your research experiments.

## 1. Creating a Backend Module

All specific experiment logic should be isolated in `server/pocs/`. Create a new file, for example `server/pocs/my-experiment.ts`.

```typescript
import { Hono } from 'hono'

const app = new Hono()

// Define your routes
app.get('/data', (c) => {
  return c.json({
    id: 1,
    name: 'Research Data',
    status: 'success'
  })
})

app.post('/compute', async (c) => {
  const body = await c.req.json()
  // Perform some complex research calculation...
  return c.json({ result: body.value * 2 })
})

export default app
```

## 2. Registering the Module

To make your backend module active, you must mount it in the main API router located at `server/routes.ts`.

```typescript
import { Hono } from 'hono'
import myExperiment from './pocs/my-experiment' // 1. Import your module

const api = new Hono()

// ... existing routes ...

api.route('/my-experiment', myExperiment) // 2. Mount it

export default api
```

Your routes will now be available at `http://localhost:3001/api/my-experiment/*`.

## 3. Communication Patterns

### REST API (Frontend Fetching)
The Vite development server is pre-configured to proxy `/api` requests to the Hono server.

```tsx
// Inside your React component
const fetchData = async () => {
  const response = await fetch('/api/my-experiment/data')
  const data = await response.json()
  console.log(data)
}
```

### WebSockets
The main server entry point (`server/index.ts`) handles WebSocket upgrades. The global `/ws` endpoint is configured to echo messages. To add specialized WebSocket logic, you can modify the `upgradeWebSocket` handler in `server/index.ts`.

```typescript
// server/index.ts snippet
app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        // Add custom research logic here
        ws.send(`Processed: ${event.data}`)
      },
    }
  })
)
```

---

## Technical Features used in this project:
-   **Hono Router**: Extremely fast, TypeScript-first router.
-   **@hono/node-server**: Standard Node.js adapter for Hono.
-   **@hono/node-ws**: WebSocket helper for Node.js environments.

---

## Reference Links
-   [Hono Documentation](https://hono.dev/docs)
-   [Hono WebSockets](https://hono.dev/docs/helpers/websocket)
-   [Vite Proxy Config](https://vite.dev/config/server-options.html#server-proxy)
