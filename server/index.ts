/**
 * Hono POC Server
 * 
 * This is the main backend entry point. It serves:
 * 1. REST API routes under /api/*
 * 2. WebSocket upgrades under /ws
 */
import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { Hono } from 'hono'
import api from './routes'

const app = new Hono()

// Create Node WebSocket helper
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

/**
 * API Route Mounting
 * All logic inside server/routes.ts is prefixed with /api
 */
app.route('/api', api)

/**
 * Global WebSocket Handler
 * Forwards messages back to the client (echo) as a basic connectivity test.
 */
app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`)
        ws.send(`Echo from Hono: ${event.data}`)
      },
      onOpen: () => {
        console.log('WebSocket connection opened')
      },
      onClose: () => {
        console.log('WebSocket connection closed')
      },
    }
  })
)

// Example of a top-level route
app.get('/', (c) => c.text('Hono POC Server is active.'))

const port = 3001
console.log(`🚀 Server is running on http://localhost:${port}`)

const server = serve({
  fetch: app.fetch,
  port
})

// Inject WebSocket support into the server
injectWebSocket(server)
