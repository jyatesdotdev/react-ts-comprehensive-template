import { Hono } from 'hono'

/**
 * Ralph Experiment POC Backend
 * Mounted at /api/pocs/ralph-experiment
 */
const ralphExperiment = new Hono()

ralphExperiment.get('/', (c) => {
  return c.json({
    message: 'Hello from the Ralph Experiment backend!',
    poc: 'ralph-experiment',
    timestamp: new Date().toISOString()
  })
})

export default ralphExperiment
