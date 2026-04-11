import React, { useState, useEffect } from 'react'
import POCLayout from '../../components/POCLayout'
import styled from 'styled-components'

const TodoItem = styled.div.attrs({
  className: 'flex items-center gap-4 p-3 border-b border-gray-100 last:border-b-0 group'
})``

const Checkbox = styled.input.attrs({
  type: 'checkbox',
  className: 'w-5 h-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all transform active:scale-90'
})``

const Text = styled.span.attrs<{ completed?: boolean }>({
  className: (props) => `flex-grow font-medium transition-all duration-300 ${
    props.completed ? 'line-through text-gray-400 opacity-60' : 'text-gray-700'
  }`
})<{ completed?: boolean }>``

const Input = styled.input.attrs({
  className: 'w-full p-4 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm focus:shadow-md'
})``

const Button = styled.button.attrs({
  className: 'bg-blue-600 text-white px-8 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20 mb-6'
})``

const DeleteButton = styled.button.attrs({
  className: 'opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1.5 hover:bg-red-50 rounded-lg'
})``

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function __COMPONENT_NAME__POC() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/pocs/__ID__')
      const data = await response.json()
      setTodos(data)
    } catch (err) {
      console.error('Failed to fetch todos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    
    try {
      const response = await fetch('/api/pocs/__ID__', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo })
      })
      if (response.ok) {
        setNewTodo('')
        fetchTodos()
      }
    } catch (err) {
      console.error('Failed to add todo:', err)
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/pocs/__ID__/${id}/toggle`, {
        method: 'PATCH'
      })
      if (response.ok) fetchTodos()
    } catch (err) {
      console.error('Failed to toggle todo:', err)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/pocs/__ID__/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) fetchTodos()
    } catch (err) {
      console.error('Failed to delete todo:', err)
    }
  }

  return (
    <POCLayout 
      title="__NAME__" 
      subtitle="Full-stack state management for __NAME__ using Hono backend and React."
      badge="POC"
      badgeType="POC"
      pocId="__ID__"
    >
      <div className="max-w-md mx-auto">
        <form onSubmit={addTodo} className="flex gap-2">
          <Input 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)} 
            placeholder="What's on your mind?"
          />
          <Button type="submit">Add</Button>
        </form>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Research Queue</span>
            {isLoading && (
               <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-600" />
            )}
          </div>
          
          {todos.map(todo => (
            <TodoItem key={todo.id}>
              <Checkbox 
                checked={todo.completed} 
                onChange={() => toggleTodo(todo.id)} 
              />
              <Text completed={todo.completed}>{todo.text}</Text>
              <DeleteButton onClick={() => deleteTodo(todo.id)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </DeleteButton>
            </TodoItem>
          ))}
          
          {!isLoading && todos.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400">Nothing in the lab queue.</p>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-2">Technical Insight</h4>
          <p className="text-xs text-blue-700/80 leading-relaxed">
            This POC demonstrates <strong>Optimistic-Lite</strong> patterns. State is updated by re-fetching from the server to ensure high-fidelity consistency with the backend, which is running a Hono instance.
          </p>
        </div>
      </div>
    </POCLayout>
  )
}

