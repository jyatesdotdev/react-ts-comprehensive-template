import { Hono } from 'hono'

/**
 * __NAME__ POC Backend
 * Mounted at /api/pocs/__ID__
 */
const __BINDING__ = new Hono()

__BINDING__.get('/', (c) => {
  return c.json({
    message: 'Hello from the __NAME__ backend!',
    poc: '__ID__',
    timestamp: new Date().toISOString()
  })
})

export default __BINDING__
