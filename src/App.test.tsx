import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { axe } from './test/axe'
import { renderWithProviders } from './test/render'

// Static layout from the sketch: no loading or error states yet, those come with the live screen.
describe('Review layout', () => {
  it('sees the question the AI researched and that it is in review', () => {
    renderWithProviders(<App />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Does a short evening walk help older adults fall asleep faster?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('In review')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Badge key' })).toBeInTheDocument()
  })

  it('reads the AI claims with their citation numbers and the AI caveat', () => {
    renderWithProviders(<App />)
    const answer = screen.getByRole('region', { name: 'AI answer' })
    expect(within(answer).getByText(/badges are the AI’s own checks/)).toBeInTheDocument()
    expect(within(answer).getByText(/shortened the time adults over 65/)).toHaveTextContent('1')
    expect(within(answer).getByText(/Walking in daylight/)).toHaveTextContent('3')
  })

  it('sees each source with its title, grade, badges and quote', () => {
    renderWithProviders(<App />)
    const sources = screen.getByRole('region', { name: 'Sources' })
    expect(within(sources).getAllByRole('heading', { level: 3 })).toHaveLength(3)
    const checks = within(sources).getByRole('list', { name: 'Checks for source 2' })
    expect(within(checks).getByText('Details differ')).toBeInTheDocument()
    expect(within(checks).getByText('Reference check:')).toBeInTheDocument()
    expect(within(sources).getAllByText('Evidence strength:')).toHaveLength(3)
    expect(within(sources).getAllByText('Lowered because:')).toHaveLength(2)
  })

  it('opens a source and reads the full passage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const trigger = screen.getByRole('button', { name: /Evening walking and sleep onset/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Participants walked for 20 minutes/)).toBeVisible()
  })

  it('goes from a claim’s citation number to the source it cites', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: 'Go to source 2' }))
    expect(screen.getByRole('button', { name: /Habitual activity and the fading/ })).toHaveFocus()
  })

  it('opens a source at the marked quote, with its reference code opening the original', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<App />)
    await user.click(screen.getByRole('button', { name: /Evening walking and sleep onset/ }))
    expect(screen.getByText('Quoted excerpt starts.')).toBeInTheDocument()
    expect(
      screen.getByText('Sleep onset latency fell by a mean of 12 minutes in the walking group'),
    ).toBeVisible()
    const original = screen.getByRole('link', { name: /MJSH-2024-0417/ })
    expect(original).toHaveAttribute('target', '_blank')
    expect(original).toHaveAccessibleName('MJSH-2024-0417 (opens the original in a new tab)')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('closes an open source with Escape and lands back on its chevron', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const trigger = screen.getByRole('button', { name: /Light exposure timing/ })
    await user.click(trigger)
    await user.tab()
    expect(screen.getByRole('link', { name: /HRA-2023-0212/ })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('sees Revise, Approve and Feedback', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('button', { name: 'Revise' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Feedback' })).toBeInTheDocument()
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
  })

  it('hides every decorative icon from assistive technology', () => {
    const { container } = renderWithProviders(<App />)
    const exposed = Array.from(container.querySelectorAll('svg')).filter(
      (icon) => icon.getAttribute('aria-hidden') !== 'true' && !icon.getAttribute('aria-label'),
    )
    expect(exposed).toEqual([])
  })
})
