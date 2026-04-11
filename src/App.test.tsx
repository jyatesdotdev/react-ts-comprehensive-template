import { render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('renders the navbar logo', () => {
    render(<App />)
    expect(screen.getByText(/POC TEMPLATE/i)).toBeInTheDocument()
  })

  it('renders home page by default', () => {
    render(<App />)
    expect(screen.getByText(/React \+ TS Template/i)).toBeInTheDocument()
  })

  it('contains navigation links', () => {
    render(<App />)
    // Use role and name to be specific and avoid multiple matches
    expect(screen.getByRole('link', { name: /WebGL/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /API/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Todo/i })).toBeInTheDocument()
  })
})
