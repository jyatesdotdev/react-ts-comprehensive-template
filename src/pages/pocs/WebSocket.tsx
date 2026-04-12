import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

// Card is the main container for the POC content block.
// Adjusting 'bg-white' changes the background color, 'rounded-xl' changes border radius, 'max-w-2xl mx-auto' centers the element with a maximum width.
const Card = styled.div.attrs({
  className: 'bg-white shadow-sm rounded-xl p-8 border border-gray-100 w-full max-w-2xl mx-auto'
})``

// MessageLog is the terminal-like display for chat/messages.
// Adjusting 'bg-gray-900 text-green-400' creates the hacker-terminal aesthetic. 'h-64 overflow-y-auto' creates the scrolling fixed-height container.
const MessageLog = styled.div.attrs({
  className: 'bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto mb-4 font-mono text-sm'
})``

// InputGroup holds the text input and send button.
// Adjusting 'flex gap-2' ensures they are spaced correctly on the same line.
const InputGroup = styled.div.attrs({
  className: 'flex gap-2'
})``

// Input is the primary text field.
// Adjusting 'focus:ring-purple-500' alters the highlight color. 'flex-grow' ensures it takes up all remaining space next to the button.
const Input = styled.input.attrs({
  className: 'flex-grow p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none'
})``

// Button triggers the send action.
// Adjusting 'bg-purple-600' modifies the color. 'disabled:bg-gray-400' specifies the visual state when no input is present or disconnected.
const Button = styled.button.attrs({
  className: 'bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md disabled:bg-gray-400'
})``

// StatusBadge visually indicates connection health.
// Adjusting the dynamic template literal allows switching between 'bg-green-500' and 'bg-red-500' based on the '$connected' prop.
const StatusBadge = styled.span.attrs<{ $connected: boolean }>((props) => ({
  className: `inline-block w-3 h-3 rounded-full mr-2 ${props.$connected ? 'bg-green-500' : 'bg-red-500'}`
}))<{ $connected: boolean }>``

export default function WebSocketPOC() {
  const [messages, setMessages] = useState<{ type: 'sent' | 'received', text: string, time: string }[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Vite proxy will handle the /ws connection to localhost:3001
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`)
    
    socket.onopen = () => {
      setConnected(true)
      console.log('Connected to WebSocket server')
    }

    socket.onmessage = (event) => {
      const message = {
        type: 'received' as const,
        text: event.data,
        time: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, message])
    }

    socket.onclose = () => {
      setConnected(false)
      console.log('Disconnected from WebSocket server')
    }

    socketRef.current = socket

    return () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

    socketRef.current.send(input)
    const message = {
      type: 'sent' as const,
      text: input,
      time: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, message])
    setInput('')
  }

  return (
    <POCLayout 
      title="WebSocket Messaging" 
      subtitle="Bi-directional communication testing with Hono."
      badge="POC"
      badgeType="POC"
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <StatusBadge $connected={connected} />
            <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <code className="text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded">
            WS /ws
          </code>
        </div>

        <MessageLog ref={logRef}>
          {messages.length === 0 && (
            <div className="text-gray-500 italic opacity-50">No messages yet. Send something to see it echoed back.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 ${m.type === 'sent' ? 'text-gray-400' : 'text-green-400'}`}>
              <span className="text-[10px] mr-2">[{m.time}]</span>
              <span className="font-bold mr-2">{m.type === 'sent' ? 'Client:' : 'Server:'}</span>
              {m.text}
            </div>
          ))}
        </MessageLog>

        <form onSubmit={sendMessage}>
          <InputGroup>
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..."
              disabled={!connected}
            />
            <Button type="submit" disabled={!connected || !input.trim()}>
              Send
            </Button>
          </InputGroup>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600">
          <h4 className="font-bold mb-2 uppercase tracking-tighter text-gray-400">Implementation Details</h4>
          <p className="mb-2">1. The Vite proxy handles <code>/ws</code> by forwarding it to the backend on port 3001.</p>
          <p>2. The Hono backend uses <code>@hono/node-ws</code> to manage the WebSocket upgrade.</p>
        </div>
      </Card>
    </POCLayout>
  )
}
