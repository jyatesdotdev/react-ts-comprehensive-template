import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Tutorials from './Tutorials'

const renderTutorials = () =>
  render(
    <MemoryRouter>
      <Tutorials />
    </MemoryRouter>
  )

describe('Tutorials', () => {
  it('renders overview by default', () => {
    renderTutorials()
    expect(screen.getByText(/Research Lab Tutorials/i)).toBeInTheDocument()
  })

  it.each([
    ['Adding POCs', 'Adding a New POC'],
    ['Backend Server', 'Backend Integration'],
    ['Testing Guide', 'Unit Testing (Vitest)'],
    ['WebGL / 3D', 'WebGL (Three.js)'],
    ['WebSockets', 'WebSocket Guide'],
    ['WebRTC / P2P', 'WebRTC Guide'],
    ['API Fetching', 'API Data Fetching'],
    ['State & Persistence', 'Todo (State Management)'],
  ])('renders %s tab', (tab, content) => {
    renderTutorials()
    fireEvent.click(screen.getByRole('button', { name: tab }))
    expect(screen.getByText(content)).toBeInTheDocument()
  })
})
