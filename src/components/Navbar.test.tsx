import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Navbar from './Navbar'

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )

describe('Navbar', () => {
  it('opens and closes experiments dropdown', () => {
    renderNavbar()
    const btn = screen.getByRole('button', { name: /Experiments/i })
    fireEvent.click(btn)
    expect(screen.getByText('Ralph Experiment')).toBeInTheDocument()
    fireEvent.click(btn)
  })

  it('closes dropdown on outside click', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: /Experiments/i }))
    fireEvent.mouseDown(document.body)
  })

  it('closes dropdown when selecting an item', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: /Experiments/i }))
    fireEvent.click(screen.getByText('Ralph Experiment'))
  })
})
