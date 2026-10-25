import AxeBuilder from '@axe-core/playwright'
import { test as base, expect } from '@playwright/test'
import type { Theme } from '../src/lib/theme'
import { WCAG_TAGS } from '../src/test/wcag'

type Options = { theme: Theme }

type Fixtures = {
  /** Navigate to the app with the project's theme applied via query string. */
  gotoApp: (path?: string) => Promise<void>
  /** axe scanner pre-scoped to the shared WCAG tag set. */
  makeAxe: () => AxeBuilder
}

export const test = base.extend<Options & Fixtures>({
  theme: ['material', { option: true }],

  gotoApp: async ({ page, theme }, provide) => {
    await provide(async (path = '/') => {
      const url = new URL(path, 'http://placeholder')
      url.searchParams.set('theme', theme)
      await page.goto(`${url.pathname}${url.search}`)
      await page.getByRole('main').waitFor()
    })
  },

  makeAxe: async ({ page }, provide) => {
    await provide(() => new AxeBuilder({ page }).withTags([...WCAG_TAGS]))
  },
})

export { expect }

type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number]

/** Human-readable failure output: rule, impact, help URL, and each offending node. */
export function formatViolations(violations: Violation[]): string {
  if (violations.length === 0) return 'No violations.'
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `      • ${node.target.join(' ')}\n        ${node.failureSummary ?? ''}`)
        .join('\n')
      return `  ✖ ${violation.id} [${violation.impact ?? 'n/a'}] ${violation.help}\n    ${violation.helpUrl}\n${nodes}`
    })
    .join('\n\n')
}
