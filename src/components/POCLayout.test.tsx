import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import POCLayout from './POCLayout'

const renderLayout = (
  props: { title: string; pocId?: string; subtitle?: string; badge?: string; badgeType?: 'WIP' | 'POC' | 'STABLE' | 'Template' },
  initialEntries: string[] = ['/']
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <POCLayout {...props}>page body</POCLayout>
    </MemoryRouter>
  )

describe('POCLayout', () => {
  it('renders the title', () => {
    renderLayout({ title: 'Layout Title' })
    expect(screen.getByRole('heading', { name: 'Layout Title' })).toBeInTheDocument()
  })

  it('does not render a Backend API link without pocId', () => {
    renderLayout({ title: 'No API' })
    expect(screen.queryByRole('link', { name: /Backend API/i })).not.toBeInTheDocument()
  })

  it('links Backend API to the Hono poc mount when pocId is set', () => {
    renderLayout({ title: 'Todo Lab', pocId: 'todo' })
    const link = screen.getByRole('link', { name: /Backend API/i })
    expect(link).toHaveAttribute('href', '/api/pocs/todo')
  })

  it.each([
    ['WIP', 'WIP'],
    ['POC', 'POC'],
    ['STABLE', 'STABLE'],
    ['Template', 'Template'],
  ] as const)('renders a %s badge', (badgeType, badge) => {
    renderLayout({ title: `${badgeType} Page`, badge, badgeType })
    expect(screen.getByText(badge, { selector: 'h1 + span' })).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    renderLayout({ title: 'Subtitled', subtitle: 'A subtitle' })
    expect(screen.getByText('A subtitle')).toBeInTheDocument()
  })

  it('opens the experiment switcher and marks the active path', () => {
    renderLayout({ title: 'Switcher' }, ['/pocs/todo'])
    fireEvent.click(screen.getByRole('button', { name: /Experiments/i }))
    expect(screen.getByText('Switch Experiment')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Todo List'))
  })

  it('closes the switcher on outside click', () => {
    renderLayout({ title: 'Outside' })
    fireEvent.click(screen.getByRole('button', { name: /Experiments/i }))
    fireEvent.mouseDown(document.body)
  })

  it('copies the current path', () => {
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    renderLayout({ title: 'Copy Path Page' })
    fireEvent.click(screen.getByRole('button', { name: /Copy Path/i }))
    expect(writeText).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Copied!/i })).toBeInTheDocument()
  })
})
