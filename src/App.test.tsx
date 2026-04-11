import { render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect } from 'vitest'

describe('App', () => {
  it('renders the navbar logo', () => {
    render(<App />)
    // Find specifically the link in the nav
    const logo = screen.getByRole('link', { name: /RESEARCH LAB/i })
    expect(logo).toBeInTheDocument()
  })

  it('renders home page by default', () => {
    render(<App />)
    expect(screen.getByText(/Extensible React \+ TS playground/i)).toBeInTheDocument()
  })

  it('contains navigation links', () => {
    render(<App />)
    // Use getAllByRole because there might be multiple "Experiments" buttons/texts
    const experimentsButtons = screen.getAllByText(/Experiments/i)
    expect(experimentsButtons.length).toBeGreaterThan(0)
    
    // Check for some of the technology links
    expect(screen.getByRole('link', { name: /React 19/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Vite 8/i })).toBeInTheDocument()
  })
})
