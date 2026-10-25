import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/**
 * What a screen reader user gets — asserted from the accessibility tree, not the DOM.
 *
 * A screen reader reads the browser's accessibility tree: roles, accessible names,
 * states, and live-region announcements, in tree order. These tests pin that tree,
 * so they cover most of what a manual screen-reader pass checks:
 *   1.1.1 Non-text Content (icons hidden, alt text meaningful)
 *   1.3.1 Info and Relationships (landmarks, heading outline, groups, labels)
 *   2.4.3 Focus Order after dynamic changes (menu, dialog, retry)
 *   2.4.6 Headings and Labels · 4.1.2 Name, Role, Value · 4.1.3 Status Messages
 * What still needs a human is listed in the README under "What remains manual".
 */

/** The tree a screen reader walks on the page at rest, in reading order. */
function expectedTree(): string {
  return `
    - main:
      - heading "Assignment18" [level=1]
      - form "Project summary":
        - heading "Project summary" [level=2]
        - paragraph: /Draft/
        - group "Document type":
          - text: Document type
          - button "Report" [pressed]
          - button "Proposal"
          - button "Specification"
          - button "Notes"
        - text: Summary
        - textbox "Summary"
        - paragraph: Plain language. Avoid personal or confidential information.
        - group "Tags":
          - text: Tags Internal
          - button "Remove Internal"
          - text: Research
          - button "Remove Research"
          - text: Follow-up
          - button "Remove Follow-up"
          - button "Add tag"
        - button "Cancel"
        - button "Submit"
    - region "Notifications"
  `
}

const notifications = (page: Page) => page.getByRole('region', { name: 'Notifications' })

async function waitForApi(page: Page) {
  await expect(notifications(page).getByText(/^API ok/)).toBeVisible()
}

/** Tag name and attributes of the focused element, for failure messages. */
async function focusedDescription(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return 'body'
    const name = el.getAttribute('aria-label') ?? el.textContent?.trim() ?? ''
    return `${el.tagName.toLowerCase()} "${name}"`
  })
}

test.describe('screen reader experience', () => {
  test('accessibility tree matches the expected reading order', async ({ page, gotoApp }) => {
    await gotoApp()
    await waitForApi(page)
    await expect(page.locator('body')).toMatchAriaSnapshot(expectedTree())
  })

  test('landmarks and heading outline (WCAG 1.3.1, 2.4.6)', async ({ page, gotoApp }) => {
    await gotoApp()
    // No top bar: the screen is the page, and the API health is a toast.
    await expect(page.getByRole('banner')).toHaveCount(0)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

    // Heading levels may only step down by one at a time: h1 → h2 → h3, never h1 → h3.
    const levels = await page
      .getByRole('heading')
      .evaluateAll((headings) =>
        headings.map((heading) => Number(heading.getAttribute('aria-level') ?? heading.tagName[1])),
      )
    expect(levels[0], 'the first heading is the h1').toBe(1)
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i], `heading #${i + 1} skips a level`).toBeLessThanOrEqual(levels[i - 1]! + 1)
    }
  })

  test('every control exposes its name, role and state (WCAG 4.1.2)', async ({ page, gotoApp }) => {
    await gotoApp()
    await waitForApi(page)

    // Filter chips are toggles: the selection is in aria-pressed, not only in the colour.
    await expect(page.getByRole('button', { name: 'Report' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    for (const name of ['Proposal', 'Specification', 'Notes']) {
      await expect(page.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false')
    }

    // Icon-only remove buttons say what they remove.
    for (const tag of ['Internal', 'Research', 'Follow-up']) {
      await expect(page.getByRole('button', { name: `Remove ${tag}` })).toBeVisible()
    }

    // The text field has a label and its supporting text as the description.
    const summary = page.getByRole('textbox', { name: 'Summary' })
    await expect(summary).toHaveAccessibleName('Summary')
    await expect(summary).toHaveAccessibleDescription(
      'Plain language. Avoid personal or confidential information.',
    )
  })

  test('decorative icons are hidden and images have meaningful alt text (WCAG 1.1.1)', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp()
    await waitForApi(page)

    // Every inline SVG is either explicitly decorative or has a real name.
    const unnamedIcons = await page
      .locator('svg')
      .evaluateAll((icons) =>
        icons
          .filter(
            (icon) =>
              icon.getAttribute('aria-hidden') !== 'true' &&
              !icon.getAttribute('aria-label') &&
              !icon.getAttribute('aria-labelledby') &&
              !icon.querySelector('title'),
          )
          .map((icon) => icon.outerHTML.slice(0, 120)),
      )
    expect(unnamedIcons, 'SVGs that are neither aria-hidden nor named').toEqual([])

    // axe only checks that alt exists; this checks that it says something useful.
    const badAlts = await page.locator('img').evaluateAll((images) =>
      images
        .map((img) => ({ src: img.getAttribute('src') ?? '', alt: img.getAttribute('alt') }))
        .filter(({ alt }) => {
          if (alt === null) return true
          if (alt === '') return false // explicitly decorative
          const text = alt.trim().toLowerCase()
          return (
            text.length < 3 ||
            text.length > 150 ||
            /\.(png|jpe?g|gif|svg|webp)$/.test(text) ||
            /^(image|picture|photo|icon|graphic|logo)$/.test(text) ||
            /^(image|picture|photo) of\b/.test(text)
          )
        }),
    )
    expect(badAlts, 'images whose alt is missing, a filename or a generic word').toEqual([])
  })

  test('API health updates one toast in a polite live region (WCAG 4.1.3)', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp('/?mock=slow')
    const region = notifications(page)
    await expect(region).toHaveAttribute('aria-live', 'polite')
    const toast = region.getByRole('dialog')
    await expect(toast).toHaveAccessibleName('Checking API…')

    // A live region only announces changes to content that is already in the tree.
    // The toast that said "Checking API…" must be the one that later says "API ok".
    const initial = await toast.elementHandle()
    await expect(toast).toHaveAccessibleName(/^API ok/, { timeout: 15_000 })
    expect(
      await initial!.evaluate((el) => el.isConnected && /API ok/.test(el.textContent ?? '')),
      'the toast was replaced instead of updated, so nothing was announced',
    ).toBe(true)
    // It does not take focus when it appears.
    expect(await focusedDescription(page)).toBe('body')
  })

  test('the API error is announced without taking focus, F6 reaches Retry, and Retry does not strand focus (WCAG 4.1.3, 2.4.3)', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp('/?mock=down')
    const toast = notifications(page).getByRole('dialog', { name: 'API unavailable' })
    await expect(toast).toHaveAccessibleDescription(/HTTP 503/, { timeout: 15_000 })
    await expect(notifications(page)).toHaveAttribute('aria-live', 'polite')
    expect(await focusedDescription(page), 'the toast must not steal focus').toBe('body')

    // F6 then Tab reaches the toast and its Retry, without walking the whole page.
    await page.keyboard.press('F6')
    await page.keyboard.press('Tab')
    await expect(toast).toBeFocused()
    await page.keyboard.press('Tab')
    const retry = toast.getByRole('button', { name: 'Retry' })
    await expect(retry).toBeFocused()
    await page.keyboard.press('Enter')

    // The Retry button is gone; focus stays on the toast, which reads out the progress.
    const updated = notifications(page).getByRole('dialog')
    await expect(updated).toHaveAccessibleName(/Retrying|Checking/)
    await expect(updated).toBeFocused()
  })

  test('the dialog is modal: named, described, and the page behind it is hidden', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp()
    await page.getByRole('button', { name: 'Submit' }).click()

    const dialog = page.getByRole('dialog', { name: 'Submit for review?' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAccessibleDescription(
      'The summary will be locked and sent to the review queue.',
    )
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Submit for review?')
    await expect(dialog).toMatchAriaSnapshot(`
      - dialog "Submit for review?":
        - heading "Submit for review?" [level=2]
        - paragraph: The summary will be locked and sent to the review queue.
        - button "Cancel"
        - button "Submit"
    `)

    // While the dialog is open a screen reader must not be able to wander into the page.
    await expect(page.getByRole('main')).toHaveCount(0)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('main')).toHaveCount(1)
  })
})
