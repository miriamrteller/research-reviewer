import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import App from './App'
import { requestLog } from './mocks/applyScenario'
import { server } from './mocks/node'
import { setScenario } from './mocks/scenario'
import { axe } from './test/axe'
import { renderWithProviders } from './test/render'

const QUESTION =
  'Summarise the recurring data-quality issues reported this quarter and suggest next steps.'

async function renderLoaded() {
  const user = userEvent.setup()
  const view = renderWithProviders(<App />)
  await screen.findByRole('heading', { level: 1, name: QUESTION })
  return { user, ...view }
}

describe('Review screen', () => {
  it('sees that the review is loading', async () => {
    setScenario('slow')
    const { container } = renderWithProviders(<App />)
    const loading = screen.getByRole('status')
    expect(loading).toHaveTextContent('Loading the review…')
    expect(loading).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Badge key' })).toBeEnabled()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('sees the error and retries', async () => {
    setScenario('down')
    const user = userEvent.setup()
    const { container } = renderWithProviders(<App />)
    const main = screen.getByRole('main')
    const alert = await within(main).findByRole('alert', {}, { timeout: 5000 })
    expect(alert).toHaveTextContent('The review could not be loaded')
    expect(await axe(container)).toHaveNoViolations()
    setScenario('ok')
    await user.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('heading', { level: 1, name: QUESTION })).toBeInTheDocument()
  })

  it('sees the question, that it is in review, and the AI caveat with the claims', async () => {
    const { container } = await renderLoaded()
    expect(screen.getByText('In review')).toBeInTheDocument()
    const answer = screen.getByRole('region', { name: 'AI answer' })
    expect(within(answer).getByText(/Confirm that they apply/)).toHaveTextContent(
      'AI-generated answer.',
    )
    expect(within(answer).getByText(/concentrated in incomplete mandatory/)).toBeInTheDocument()
    expect(within(answer).getAllByRole('button', { name: /^Go to source/ })).toHaveLength(3)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('sees each source with its five badges and why a badge was lowered', async () => {
    await renderLoaded()
    const sources = screen.getByRole('region', { name: 'Sources' })
    expect(within(sources).getAllByRole('heading', { level: 3 })).toHaveLength(3)
    const checks = within(sources).getByRole('list', { name: 'Checks for source 3' })
    expect(within(checks).getByText('Partly supported')).toBeInTheDocument()
    expect(within(sources).getAllByText('Evidence strength:')).toHaveLength(3)
    expect(within(sources).getByText('Weak')).toBeInTheDocument()
    expect(within(sources).getAllByText('Lowered because:')).toHaveLength(1)
  })

  it('opens a source and reads the full passage', async () => {
    const { user } = await renderLoaded()
    const trigger = screen.getByRole('button', { name: /Quarterly Data Quality Review/ })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByText(/Delayed analysis handover was the most common reported impact/),
    ).toBeVisible()
  })

  it('goes from a claim’s citation number to the source it cites', async () => {
    const { user } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Go to source 3' }))
    expect(screen.getByRole('button', { name: /Data Sharing Readiness Checklist/ })).toHaveFocus()
  })

  it('opens a source at the marked quote, with its reference code opening the original', async () => {
    const { user, container } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: /Quarterly Data Quality Review/ }))
    expect(screen.getByText('Quoted excerpt starts.')).toBeInTheDocument()
    const original = screen.getByRole('link', { name: /SRC-01/ })
    expect(original).toHaveAttribute('target', '_blank')
    expect(original).toHaveAccessibleName('SRC-01 (opens the original in a new tab)')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('closes an open source with Escape and lands back on its chevron', async () => {
    const { user } = await renderLoaded()
    const trigger = screen.getByRole('button', { name: /Data Sharing Readiness Checklist/ })
    await user.click(trigger)
    await user.tab()
    expect(screen.getByRole('link', { name: /SRC-03/ })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('approves with confirmation and a note, and the page goes read-only', async () => {
    const { user, container } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    const dialog = screen.getByRole('dialog', { name: 'Approve this answer?' })
    const confirm = within(dialog).getByRole('button', { name: 'Approve' })
    expect(confirm).toBeDisabled()
    expect(await axe(container.ownerDocument.body)).toHaveNoViolations()
    await user.click(within(dialog).getByRole('checkbox', { name: /I have read the claims/ }))
    await user.type(within(dialog).getByLabelText('Note (optional)'), 'Fine for the Q3 pack.')
    await user.click(confirm)

    const status = await screen.findByText('Approved')
    expect(status.closest('#review-status')).toHaveTextContent('by Prof. I. C. Everything')
    expect(screen.getByText('Note: Fine for the Q3 pack.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revise' })).not.toBeInTheDocument()
    await waitFor(() => expect(status.closest('#review-status')).toHaveFocus())
    expect(requestLog.filter((r) => r === 'POST /api/review/approve')).toHaveLength(1)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('cannot send back without a reason, then sends back and the page goes read-only', async () => {
    const { user } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Revise' }))
    const dialog = screen.getByRole('dialog', { name: /Send this answer back/ })
    await user.click(within(dialog).getByRole('button', { name: 'Send for revision' }))
    const reason = within(dialog).getByLabelText('Reason')
    expect(reason).toHaveAccessibleDescription('Write a reason before sending the answer back.')
    expect(reason).toHaveAttribute('aria-invalid', 'true')
    await user.type(reason, 'Claim 3 needs a source for named owners.')
    await user.click(within(dialog).getByRole('button', { name: 'Send for revision' }))

    expect(await screen.findByText('Revision needed')).toBeInTheDocument()
    expect(screen.getByText('Reason: Claim 3 needs a source for named owners.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('edits a claim, saves, and sees the new wording with who edited it and when', async () => {
    const { user, container } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await waitFor(() => expect(screen.getByLabelText('Claim 1 of 3')).toHaveFocus())
    const field = screen.getByLabelText('Claim 2 of 3')
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Save or discard your changes')
    expect(await axe(container)).toHaveNoViolations()
    await user.clear(screen.getByLabelText('Claim 1 of 3'))
    await user.type(field, ' Two teams reported it.')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByLabelText('Claim 1 of 3')).toHaveAccessibleDescription(/cannot be empty/)
    await user.type(screen.getByLabelText('Claim 1 of 3'), 'Issues were concentrated in two areas.')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const edit = screen.getByRole('button', { name: 'Edit' })
    await waitFor(() => expect(edit).toHaveFocus())
    const answer = screen.getByRole('region', { name: 'AI answer' })
    expect(within(answer).getByText(/Two teams reported it/)).toBeInTheDocument()
    expect(within(answer).getAllByRole('button', { name: /^Go to source/ })).toHaveLength(3)
    expect(within(answer).getAllByText(/Edited by Prof. I. C. Everything/)).toHaveLength(2)
    expect(within(answer).getByText(/named data owners/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('kept on this page only')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('discards an edit and the text returns, with nothing marked as edited', async () => {
    const { user } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.type(screen.getByLabelText('Claim 2 of 3'), ' Not for long.')
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    const answer = screen.getByRole('region', { name: 'AI answer' })
    expect(within(answer).queryByText(/Not for long/)).not.toBeInTheDocument()
    expect(within(answer).queryByText(/Edited by/)).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus())
  })

  it('approves after editing and the edited wording is what gets approved', async () => {
    const { user } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.type(screen.getByLabelText('Claim 3 of 3'), ' Pilot it on one dataset first.')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    const dialog = screen.getByRole('dialog', { name: 'Approve this answer?' })
    await user.click(within(dialog).getByRole('checkbox'))
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }))
    expect(await screen.findByText('Approved')).toBeInTheDocument()
    const answer = screen.getByRole('region', { name: 'AI answer' })
    expect(within(answer).getByText(/Pilot it on one dataset first/)).toBeInTheDocument()
    expect(within(answer).getByText(/Edited by Prof. I. C. Everything/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('sees a failed approval in the dialog, and it is not retried on its own', async () => {
    let calls = 0
    server.use(
      http.post('/api/review/approve', () => {
        calls += 1
        return HttpResponse.json({ error: 'down' }, { status: 503 })
      }),
    )
    const { user } = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    const dialog = screen.getByRole('dialog', { name: 'Approve this answer?' })
    await user.click(within(dialog).getByRole('checkbox'))
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Nothing was saved')
    expect(calls).toBe(1)
    expect(screen.getByText('In review')).toBeInTheDocument()
  })

  it('has no top bar: one main, one h1 and no skipped heading levels', async () => {
    await renderLoaded()
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

  it('hides every decorative icon from assistive technology', async () => {
    const { container } = await renderLoaded()
    const exposed = Array.from(container.querySelectorAll('svg')).filter(
      (icon) => icon.getAttribute('aria-hidden') !== 'true' && !icon.getAttribute('aria-label'),
    )
    expect(exposed).toEqual([])
  })
})
