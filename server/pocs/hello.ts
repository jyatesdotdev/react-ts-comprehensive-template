import { Hono } from 'hono'

const hello = new Hono()

hello.get('/', (c) => {
  return c.json({
    message: 'Hello from the Hello POC server module!',
    timestamp: new Date().toISOString()
  })
})

export default hello
