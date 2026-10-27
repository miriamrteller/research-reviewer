import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { receivedFeedback, resetFeedback } from '../mocks/handlers/feedback'
import { setScenario } from '../mocks/scenario'
import { axe } from '../test/axe'
import { renderWithProviders } from '../test/render'

describe('Badge key', () => {
  it('opens the badge key and reads every signal, its values and its question', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    await user.click(await screen.findByRole('button', { name: 'Badge key' }))
    const key = await screen.findByRole('dialog', { name: 'Badge key' })
    const rows = within(key).getAllByRole('rowheader')
    expect(rows.map((row) => row.textContent)).toEqual([
      'Reference check',
      'Publication status',
      'Claim support',
      'Stance',
      'Evidence strength',
    ])
    const stance = within(key).getByRole('list', { name: 'Stance values' })
    expect(within(stance).getAllByRole('listitem')).toHaveLength(3)
    expect(within(key).getByText('How much weight does this kind of study carry?')).toBeVisible()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('closes the badge key with Escape and returns to the button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const trigger = await screen.findByRole('button', { name: 'Badge key' })
    await user.click(trigger)
    await screen.findByRole('dialog', { name: 'Badge key' })
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Badge key' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})

describe('Feedback', () => {
  beforeEach(() => resetFeedback())

  async function fillAndSend(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Feedback' }))
    const dialog = await screen.findByRole('dialog', { name: 'Feedback on this workspace' })
    await user.click(within(dialog).getByRole('radio', { name: '4' }))
    await user.selectOptions(within(dialog).getByLabelText('Topic'), 'Sources and quotes')
    await user.type(within(dialog).getByLabelText('Comment (optional)'), 'Quotes are easy to find.')
    await user.click(within(dialog).getByRole('button', { name: 'Send feedback' }))
    return dialog
  }

  it('sends feedback and sees a thank-you with who sent it and when', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const dialog = await fillAndSend(user)
    expect(await within(dialog).findByText('Thank you. Your feedback was sent.')).toBeVisible()
    expect(within(dialog).getByText(/Sent by Dr. A. Morgan/)).toBeVisible()
    expect(receivedFeedback()).toEqual([
      expect.objectContaining({
        ease: 4,
        topic: 'sources',
        comment: 'Quotes are easy to find.',
        by: 'Dr. A. Morgan',
        at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    ])
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('sees that feedback was not sent when the API is down', async () => {
    setScenario('down')
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const dialog = await fillAndSend(user)
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('was not sent')
    expect(receivedFeedback()).toHaveLength(0)
  })

  it('cancels feedback and returns to the Feedback button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const trigger = screen.getByRole('button', { name: 'Feedback' })
    await user.click(trigger)
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(
      screen.queryByRole('dialog', { name: 'Feedback on this workspace' }),
    ).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
