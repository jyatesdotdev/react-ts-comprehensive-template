import { Hono } from 'hono'

/**
 * __NAME__ POC Backend
 * Mounted at /api/pocs/__ID__
 */
const __ID__ = new Hono()

__ID__.get('/', (c) => {
  return c.json({
    message: 'Hello from the __NAME__ backend!',
    poc: '__ID__',
    timestamp: new Date().toISOString()
  })
})

export default __ID__
