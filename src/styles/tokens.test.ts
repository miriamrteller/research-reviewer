// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { brandFiles, themeOf } from '../test/brand-files'
import { collectColorRoles, contrastRatio, type Palette, type Scheme } from './parse-tokens'

const material = readFileSync(new URL('./material.css', import.meta.url), 'utf8')
const index = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

const materialRoles = collectColorRoles(material, (selector) => !selector.includes('data-theme'))

/** One palette per brand file; a brand inherits anything it does not override. */
const brands = brandFiles().map((file) => {
  const theme = themeOf(file)
  const css = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8')
  const roles = collectColorRoles(css, (selector) => selector.includes(`[data-theme='${theme}']`))
  return { theme, palette: { ...materialRoles, ...roles } as Palette }
})

const scopes: Array<{ name: string; palette: Palette; scheme: Scheme }> = [
  { name: 'material · light', palette: materialRoles, scheme: 'light' },
  { name: 'material · dark', palette: materialRoles, scheme: 'dark' },
  ...brands.flatMap(({ theme, palette }) => [
    { name: `${theme} · light`, palette, scheme: 'light' as const },
    { name: `${theme} · dark`, palette, scheme: 'dark' as const },
  ]),
]

/** WCAG 1.4.3 — normal text on its background. */
const TEXT_MIN = 4.5
/** WCAG 1.4.11 — UI component boundaries and focus indicators against adjacent color. */
const NON_TEXT_MIN = 3

const textPairs: Array<[foreground: string, background: string]> = [
  ['on-primary', 'primary'],
  ['on-primary-container', 'primary-container'],
  ['on-secondary', 'secondary'],
  ['on-secondary-container', 'secondary-container'],
  ['on-tertiary', 'tertiary'],
  ['on-tertiary-container', 'tertiary-container'],
  ['on-error', 'error'],
  ['on-error-container', 'error-container'],
  ['on-surface', 'surface'],
  ['on-surface', 'surface-dim'],
  ['on-surface', 'surface-bright'],
  ['on-surface', 'surface-container-lowest'],
  ['on-surface', 'surface-container-low'],
  ['on-surface', 'surface-container'],
  ['on-surface', 'surface-container-high'],
  ['on-surface', 'surface-container-highest'],
  ['on-surface-variant', 'surface'],
  ['on-surface-variant', 'surface-variant'],
  ['on-surface-variant', 'surface-container-highest'],
  ['on-background', 'background'],
  ['inverse-on-surface', 'inverse-surface'],
  // The toast (M3 snackbar) action button.
  ['inverse-primary', 'inverse-surface'],
  ['on-primary-fixed', 'primary-fixed'],
  ['on-primary-fixed', 'primary-fixed-dim'],
  ['on-primary-fixed-variant', 'primary-fixed'],
  ['on-secondary-fixed', 'secondary-fixed'],
  ['on-secondary-fixed', 'secondary-fixed-dim'],
  ['on-secondary-fixed-variant', 'secondary-fixed'],
  ['on-tertiary-fixed', 'tertiary-fixed'],
  ['on-tertiary-fixed', 'tertiary-fixed-dim'],
  ['on-tertiary-fixed-variant', 'tertiary-fixed'],
  // Accent roles used as text (text buttons, links, inline errors) on EVERY surface tier.
  // A hue that only clears AA on pure white fails the moment it sits on a tinted card.
  ['primary', 'surface'],
  ['primary', 'surface-container-lowest'],
  ['primary', 'surface-container-low'],
  ['primary', 'surface-container'],
  ['primary', 'surface-container-high'],
  ['primary', 'surface-container-highest'],
  ['error', 'surface'],
  ['error', 'surface-container-low'],
  ['error', 'surface-container-highest'],
]

const nonTextPairs: Array<[foreground: string, background: string]> = [
  ['outline', 'surface'],
  ['outline', 'surface-container-low'],
  ['outline', 'surface-container-highest'],
  // Focus indicator color (M3: secondary) must be visible on every surface tier
  ['secondary', 'surface'],
  ['secondary', 'surface-container-low'],
  ['secondary', 'surface-container-high'],
  // Focus ring on the toast's Retry and close buttons.
  ['inverse-primary', 'inverse-surface'],
]

describe.each(scopes)('$name', ({ palette, scheme }) => {
  it.each(textPairs)('%s on %s ≥ 4.5:1 (text)', (fg, bg) => {
    const ratio = contrastRatio(palette[fg]![scheme], palette[bg]![scheme])
    expect(
      ratio,
      `${fg} ${palette[fg]![scheme]} on ${bg} ${palette[bg]![scheme]} = ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(TEXT_MIN)
  })

  it.each(nonTextPairs)('%s against %s ≥ 3:1 (non-text)', (fg, bg) => {
    const ratio = contrastRatio(palette[fg]![scheme], palette[bg]![scheme])
    expect(
      ratio,
      `${fg} ${palette[fg]![scheme]} against ${bg} ${palette[bg]![scheme]} = ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(NON_TEXT_MIN)
  })
})

describe('token wiring', () => {
  it('every M3 color role is mapped to a Tailwind utility in index.css', () => {
    const unmapped = Object.keys(materialRoles).filter(
      (role) => !index.includes(`--color-${role}: var(--md-sys-color-${role});`),
    )
    expect(unmapped).toEqual([])
  })

  it('defines the full set of M3 color roles', () => {
    // Guard against accidental deletion; M3 defines 49 color roles.
    expect(Object.keys(materialRoles)).toHaveLength(49)
  })
})
