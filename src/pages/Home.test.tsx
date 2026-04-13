import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Home from './Home'

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )

describe('Home', () => {
  it('renders all experiments by default', () => {
    renderHome()
    expect(screen.getByText(/Extensible React \+ TS playground/i)).toBeInTheDocument()
  })

  it('filters by category', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /Graphics/i }))
    // After filtering, Graphics POCs should still be visible
    expect(screen.getByText('Ralph Experiment')).toBeInTheDocument()
  })
})
