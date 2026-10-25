/**
 * WCAG conformance tags enforced across every layer of the test pyramid
 * (jsdom unit scans and the Playwright browser matrix). One definition so
 * the layers can never disagree about what "compliant" means.
 */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const
