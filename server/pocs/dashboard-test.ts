import { Hono } from 'hono'

/**
 * Dashboard Test POC Backend
 * Mounted at /api/pocs/dashboard-test
 */
const dashboardTest = new Hono()

dashboardTest.get('/', (c) => {
  return c.json({
    message: 'Hello from the Dashboard Test backend!',
    poc: 'dashboard-test',
    timestamp: new Date().toISOString()
  })
})

export default dashboardTest
