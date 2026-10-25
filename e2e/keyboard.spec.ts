import { expect, test } from './fixtures'

/**
 * Keyboard and focus behaviour — the WCAG criteria axe cannot evaluate:
 *   2.1.1 Keyboard · 2.1.2 No Keyboard Trap · 2.4.3 Focus Order
 *   2.4.7 Focus Visible · 2.4.11 Focus Not Obscured · 1.4.10 Reflow
 *   2.3.3 Animation from Interactions
 */

async function focusedName(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return ''
    const labelledBy = el.getAttribute('aria-labelledby')
    if (labelledBy) return document.getElementById(labelledBy)?.textContent?.trim() ?? ''
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel.trim()
    const labels = (el as HTMLInputElement).labels
    if (labels && labels.length > 0) return labels[0]!.textContent?.trim() ?? ''
    return (el.textContent ?? '').trim()
  })
}

/**
 * M3 has two legitimate keyboard-focus indicators:
 *   ring         3px outline, 2px offset, on buttons / chips / menu triggers
 *   active-line  text fields: the bottom indicator thickens to 2px `primary`
 * Both are verified strictly; the field variant is opted into with
 * `data-focus-indicator="active-line"` on the field container.
 */
async function focusIndicator(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return null
    const matchesFocusVisible = el.matches(':focus-visible')

    const probe = document.createElement('span')
    probe.style.color = 'var(--md-sys-color-primary)'
    document.body.append(probe)
    const primary = getComputedStyle(probe).color
    probe.remove()

    const field = el.closest<HTMLElement>('[data-focus-indicator="active-line"]')
    if (field) {
      const style = getComputedStyle(field)
      return {
        kind: 'active-line' as const,
        matchesFocusVisible,
        width: parseFloat(style.borderBottomWidth),
        isPrimary: style.borderBottomColor === primary,
      }
    }
    const style = getComputedStyle(el)
    return {
      kind: 'ring' as const,
      matchesFocusVisible,
      style: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
      offset: parseFloat(style.outlineOffset),
    }
  })
}

test.describe('keyboard operability', () => {
  test('tab order follows reading order and every stop has a visible M3 focus ring', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp()
    await expect(
      page.getByRole('region', { name: 'Notifications' }).getByText(/^API ok/),
    ).toBeVisible()

    const expectedOrder = [
      'Badge key',
      'Go to source 1',
      'Go to source 2',
      'Go to source 3',
      'Revise',
      'Approve',
      'Full passage: Evening walking and sleep onset after 65: a trial',
      'Full passage: Habitual activity and the fading benefit of walking programmes',
      'Full passage: Light exposure timing and circadian phase in later life: a review',
      'Feedback',
    ]

    for (const expected of expectedOrder) {
      await page.keyboard.press('Tab')
      expect(await focusedName(page), `expected focus on "${expected}"`).toBe(expected)

      const indicator = await focusIndicator(page)
      expect(indicator?.matchesFocusVisible, `${expected}: should match :focus-visible`).toBe(true)
      if (indicator?.kind === 'active-line') {
        expect(indicator.width, `${expected}: active indicator ≥ 2px`).toBeGreaterThanOrEqual(2)
        expect(indicator.isPrimary, `${expected}: active indicator uses primary`).toBe(true)
      } else {
        expect(indicator?.style, `${expected}: outline style`).toBe('solid')
        expect(indicator?.width, `${expected}: outline width ≥ 3px`).toBeGreaterThanOrEqual(3)
        expect(indicator?.offset, `${expected}: outline offset ≥ 2px`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  test('pointer focus does not show the keyboard focus ring', async ({ page, gotoApp }) => {
    await gotoApp()
    await page.getByRole('button', { name: 'Badge key' }).click()
    const indicator = await focusIndicator(page)
    expect(indicator?.matchesFocusVisible).toBe(false)
  })

  test('a source opens and closes from the keyboard, and focus stays on its trigger', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp()
    const trigger = page.getByRole('button', { name: /^Full passage: Habitual activity/ })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText(/We followed 212 adults/)).toBeVisible()
    await expect(trigger).toBeFocused()
    await page.keyboard.press('Space')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })

  test('theme and scheme come from the URL, with no switcher on the page', async ({
    page,
    gotoApp,
    theme,
  }) => {
    await gotoApp('/?scheme=dark')
    const applied = await page.evaluate(() => ({ ...document.documentElement.dataset }))
    expect(applied.theme ?? 'material').toBe(theme)
    expect(applied.colorScheme).toBe('dark')
    await expect(page.getByRole('button', { name: /^Theme:/ })).toHaveCount(0)
  })

  test('the API toast closes with Escape from the keyboard and focus returns to the page', async ({
    page,
    gotoApp,
  }) => {
    await gotoApp('/?mock=down')
    const toast = page.getByRole('dialog', { name: 'API unavailable' })
    await expect(toast).toBeVisible({ timeout: 15_000 })
    await page.keyboard.press('F6')
    await page.keyboard.press('Tab')
    await expect(toast).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(toast).toBeHidden()
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false)
  })

  for (const viewport of [
    { width: 360, height: 640 },
    { width: 1024, height: 480 },
    { width: 1366, height: 480 },
  ]) {
    test(`the API toast never covers a focused control at ${viewport.width}×${viewport.height} (WCAG 2.4.11)`, async ({
      page,
      gotoApp,
    }) => {
      await page.setViewportSize(viewport)
      await gotoApp()
      // Rest the pointer on the toast so it stays (its timer pauses on hover) while focus moves.
      const toast = page.getByRole('region', { name: 'Notifications' }).getByRole('dialog')
      await expect(toast).toHaveAccessibleName(/^API ok/)
      const box = await toast.boundingBox()
      await page.mouse.move(box!.x + 8, box!.y + 8)
      const last = page.getByRole('button', { name: 'Feedback' })

      for (let i = 0; i < 30; i += 1) {
        await page.keyboard.press('Tab')
        const overlap = await page.evaluate(() => {
          const focused = document.activeElement
          const toast = document.getElementById('api-health')
          if (!focused || !toast || toast.contains(focused) || focused === document.body)
            return null
          const a = focused.getBoundingClientRect()
          const b = toast.getBoundingClientRect()
          const covered =
            a.left >= b.left && a.right <= b.right && a.top >= b.top && a.bottom <= b.bottom
          return covered ? (focused.textContent ?? focused.tagName).trim() : null
        })
        expect(overlap, `focused control entirely hidden under the API toast`).toBeNull()
        if (await last.evaluate((el) => el === document.activeElement)) break
      }
      await expect(toast).toBeVisible()
    })
  }

  test('honours prefers-reduced-motion', async ({ page, gotoApp }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoApp()
    const durationMs = await page.getByRole('button', { name: 'Approve' }).evaluate((el) => {
      const raw = getComputedStyle(el).transitionDuration
      const value = parseFloat(raw)
      return raw.endsWith('ms') ? value : value * 1000
    })
    expect(durationMs).toBeLessThanOrEqual(0.01)
  })

  test('reflows at 320px without horizontal scrolling (WCAG 1.4.10)', async ({ page, gotoApp }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await gotoApp()
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })
})
