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
      - heading "Does a short evening walk help older adults fall asleep faster?" [level=1]
      - paragraph: In review
      - button "Badge key"
      - region "AI answer":
        - heading "AI answer" [level=2]
        - paragraph: /AI-generated answer/
        - text: /A 20-minute evening walk/
        - superscript:
          - button "Go to source 1"
        - text: /The benefit was smaller/
        - superscript:
          - button "Go to source 2"
        - text: /Walking in daylight/
        - superscript:
          - button "Go to source 3"
        - button "Revise"
        - button "Approve"
      - region "Sources":
        - heading "Sources" [level=2]
        - heading /^1 Evening walking/ [level=3]
        - paragraph: /Controlled study/
        - list "Checks for source 1":
          - listitem: "Reference check: Verified"
          - listitem: "Publication status: Peer reviewed"
          - listitem: "Claim support: Supported"
          - listitem: "Stance: Agrees"
        - blockquote: /Sleep onset latency/
        - text: "Evidence strength: Moderate"
        - button /^Full passage. Evening walking/
        - heading /^2 Habitual activity/ [level=3]
        - paragraph: /Observational study/
        - list "Checks for source 2":
          - listitem: "Reference check: Details differ"
          - listitem: "Publication status: Preprint"
          - listitem: "Claim support: Partly supported"
          - listitem: "Stance: Neutral"
        - paragraph:
          - strong: "Lowered because:"
          - text: /self-reported rest/
        - blockquote: /Gains were smaller/
        - text: "Evidence strength: Limited"
        - button /^Full passage. Habitual activity/
        - heading /^3 Light exposure timing/ [level=3]
      - button "Feedback"
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

    // Source cards are accordion triggers: open or closed is in aria-expanded, not only the chevron.
    for (const name of [
      /^Full passage: Evening walking/,
      /^Full passage: Habitual activity/,
      /^Full passage: Light exposure/,
    ]) {
      await expect(page.getByRole('button', { name })).toHaveAttribute('aria-expanded', 'false')
    }

    // Each badge names its group for screen readers, so "Verified" is never read alone.
    const checks = page.getByRole('list', { name: 'Checks for source 1' })
    await expect(checks.getByRole('listitem').first()).toHaveText('Reference check: Verified')
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

  test('opening a source reveals its passage and announces the expanded state', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp()
    const trigger = page.getByRole('button', { name: /^Full passage: Evening walking/ })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText(/Participants walked for 20 minutes/)).toBeVisible()
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
