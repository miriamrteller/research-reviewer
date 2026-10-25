import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { axe } from './test/axe'
import { renderWithProviders } from './test/render'

describe('App', () => {
  it('renders the document paper with an accessible structure', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Assignment18' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Project summary' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Summary' })).toHaveAccessibleDescription(
      'Plain language. Avoid personal or confidential information.',
    )
    expect(screen.getByRole('group', { name: 'Tags' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Report', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Internal' })).toBeInTheDocument()
  })

  it('has no WCAG violations at rest', async () => {
    const { container } = renderWithProviders(<App />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no top bar: one main, one h1 and no skipped heading levels', () => {
    renderWithProviders(<App />)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)

    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName[1]))
    expect(levels[0]).toBe(1)
    levels.forEach((level, i) => {
      if (i > 0) expect(level).toBeLessThanOrEqual(levels[i - 1]! + 1)
    })
  })

  it('shows the API health as a notification, not a top bar', async () => {
    renderWithProviders(<App />)
    const notifications = screen.getByRole('region', { name: 'Notifications' })
    expect(await within(notifications).findByText(/^API ok · v/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Theme:/ })).not.toBeInTheDocument()
  })

  it('hides every decorative icon from assistive technology', () => {
    const { container } = renderWithProviders(<App />)
    const exposed = Array.from(container.querySelectorAll('svg')).filter(
      (icon) => icon.getAttribute('aria-hidden') !== 'true' && !icon.getAttribute('aria-label'),
    )
    expect(exposed).toEqual([])
  })
})
