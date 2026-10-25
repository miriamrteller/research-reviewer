import { configureAxe } from 'jest-axe'

import { WCAG_TAGS } from './wcag'

export { WCAG_TAGS }

/**
 * axe configured for jsdom.
 *
 * jsdom has no layout engine, so `color-contrast` cannot compute anything
 * here and is disabled explicitly rather than left to silently no-op.
 * Contrast is enforced twice elsewhere: at the token level in
 * src/styles/tokens.test.ts and in a real browser by the Playwright matrix.
 */
export const axe = configureAxe({
  runOnly: { type: 'tag', values: [...WCAG_TAGS] },
  rules: {
    'color-contrast': { enabled: false },
  },
})
