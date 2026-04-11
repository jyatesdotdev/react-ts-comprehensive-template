import { Hono } from 'hono'

const todo = new Hono()

// In-memory "database" for the POC
let todos = [
  { id: 1, text: 'Learn Hono', completed: true },
  { id: 2, text: 'Build an API', completed: false }
]

// Get all todos
todo.get('/', (c) => {
  return c.json(todos)
})

// Add a new todo
todo.post('/', async (c) => {
  const { text } = await c.req.json()
  const newTodo = { id: Date.now(), text, completed: false }
  todos.push(newTodo)
  return c.json(newTodo, 201)
})

// Toggle todo completion
todo.patch('/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'))
  const item = todos.find(t => t.id === id)
  if (item) {
    item.completed = !item.completed
    return c.json(item)
  }
  return c.json({ error: 'Not found' }, 404)
})

// Delete a todo
todo.delete('/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  todos = todos.filter(t => t.id !== id)
  return c.json({ success: true })
})

export default todo
