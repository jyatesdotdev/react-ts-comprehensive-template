import { Hono } from 'hono'

const api = new Hono()

// Standard API routes
api.get('/hello', (c) => {
  return c.json({
    message: 'Hello from the Hono POC Server!',
    timestamp: new Date().toISOString(),
    status: 'online'
  })
})

/**
 * POC Specific Routes
 * To add a new POC server module:
 * 1. Create a file in server/pocs/ (e.g., server/pocs/my-new-poc.ts)
 * 2. Import it here
 * 3. Mount it using api.route('/my-new-poc', myNewPoc)
 */
import hello from './pocs/hello'
import todo from './pocs/todo'
import dashboardTest from './pocs/dashboard-test'
import ralphExperiment from './pocs/ralph-experiment'

api.route('/pocs/hello', hello)
api.route('/pocs/todo', todo)
api.route('/pocs/dashboard-test', dashboardTest)
api.route('/pocs/ralph-experiment', ralphExperiment)

// Placeholder for WebRTC signaling (in a real app, this might be WebSocket)
api.get('/webrtc/ice-servers', (c) => {
  return c.json({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })
})

export default api
