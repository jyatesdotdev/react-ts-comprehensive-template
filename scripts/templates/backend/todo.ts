import { Hono } from 'hono'

/**
 * __NAME__ POC Backend (Todo Example)
 * Mounted at /api/pocs/__ID__
 */
const __ID__ = new Hono()

let items = [
  { id: 1, text: 'Initial __NAME__ item', completed: false }
]

__ID__.get('/', (c) => c.json(items))

__ID__.post('/', async (c) => {
  const { text } = await c.req.json()
  const newItem = { id: Date.now(), text, completed: false }
  items.push(newItem)
  return c.json(newItem, 201)
})

__ID__.patch('/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'))
  items = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
  return c.json({ success: true })
})

__ID__.delete('/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  items = items.filter(item => item.id !== id)
  return c.json({ success: true })
})

export default __ID__
