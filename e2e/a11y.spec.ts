import { expect, formatViolations, test } from './fixtures'

/**
 * Automated WCAG 2.0 / 2.1 / 2.2 A + AA scan in a real browser.
 * Unlike the jsdom unit scans, color contrast IS evaluated here.
 * Any violation fails the run. Best-practice rules are reported, not enforced.
 */

test.describe('WCAG 2.2 AA — automated scan', () => {
  test('page at rest', async ({ gotoApp, makeAxe }) => {
    await gotoApp()
    const { violations } = await makeAxe().analyze()
    expect(violations, formatViolations(violations)).toEqual([])
  })

  test('source opened (full passage showing)', async ({ page, gotoApp, makeAxe }) => {
    await gotoApp()
    await page.getByRole('button', { name: /^Full passage: Evening walking/ }).click()
    await expect(page.getByText(/Participants walked for 20 minutes/)).toBeVisible()
    const { violations } = await makeAxe().analyze()
    expect(violations, formatViolations(violations)).toEqual([])
  })

  test('API loading toast (mock=slow)', async ({ page, gotoApp, makeAxe }) => {
    await gotoApp('/?mock=slow')
    const notifications = page.getByRole('region', { name: 'Notifications' })
    await expect(notifications.getByText('Checking API…')).toBeVisible()
    const { violations } = await makeAxe().analyze()
    expect(violations, formatViolations(violations)).toEqual([])
  })

  test('API error toast with retry (mock=down)', async ({ page, gotoApp, makeAxe }) => {
    await gotoApp('/?mock=down')
    // 1 request + 3 retries honouring Retry-After: 1 → ~3 s before the error appears.
    const toast = page
      .getByRole('region', { name: 'Notifications' })
      .getByRole('dialog', { name: 'API unavailable' })
    await expect(toast).toBeVisible({ timeout: 15_000 })
    await expect(toast.getByRole('button', { name: 'Retry' })).toBeVisible()
    const { violations } = await makeAxe().analyze()
    expect(violations, formatViolations(violations)).toEqual([])
  })

  test('best practices (report only)', async ({ page, gotoApp }, testInfo) => {
    await gotoApp()
    const { default: AxeBuilder } = await import('@axe-core/playwright')
    const { violations } = await new AxeBuilder({ page }).withTags(['best-practice']).analyze()
    await testInfo.attach('best-practice-violations.json', {
      body: JSON.stringify(violations, null, 2),
      contentType: 'application/json',
    })
    for (const violation of violations) {
      testInfo.annotations.push({
        type: 'best-practice',
        description: `${violation.id}: ${violation.help}`,
      })
    }
  })
})
