/**
 * Main API Router
 * 
 * All routes defined here are automatically mounted under /api in the main app.
 * To add a new experiment-specific API:
 * 1. Create a module in server/pocs/
 * 2. Mount it using api.route('/poc-id', module)
 */
import { Hono } from 'hono'

const api = new Hono()

/**
 * Health Check / Hello Route
 * Useful for verifying backend connectivity.
 */
api.get('/hello', (c) => {
  return c.json({
    message: 'Hello from the Hono POC Server!',
    timestamp: new Date().toISOString(),
    status: 'online'
  })
})

/**
 * Registered POC Routes
 * These match the IDs used in the frontend configuration.
 */
import hello from './pocs/hello'
import todo from './pocs/todo'
import dashboardTest from './pocs/dashboard-test'
import ralphExperiment from './pocs/ralph-experiment'

api.route('/pocs/hello', hello)
api.route('/pocs/todo', todo)
api.route('/pocs/dashboard-test', dashboardTest)
api.route('/pocs/ralph-experiment', ralphExperiment)

/**
 * Shared Utilities
 */
api.get('/webrtc/ice-servers', (c) => {
  return c.json({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })
})

export default api
