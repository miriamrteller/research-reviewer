// @vitest-environment node
// Contrast for the badge colours (ADR 001): every text/background pair a badge can use, in both schemes.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collectColorRoles, contrastRatio, type Scheme } from './parse-tokens'

const material = readFileSync(new URL('./material.css', import.meta.url), 'utf8')
const index = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

const custom = collectColorRoles(material, () => true, '--md-custom-color-')
const system = collectColorRoles(material, (selector) => !selector.includes('data-theme'))
const palette = { ...system, ...custom }

const TEXT_MIN = 4.5
const NON_TEXT_MIN = 3

const textPairs: Array<[foreground: string, background: string]> = [
  // Filled badges: word and icon on their own container.
  ['on-positive-container', 'positive-container'],
  ['on-caution-container', 'caution-container'],
  ['on-limited-container', 'limited-container'],
  ['on-error-container', 'error-container'],
  // Neutral badge: outlined, on the source card surface.
  ['on-surface-variant', 'surface'],
  ['on-surface-variant', 'surface-container-low'],
  // Solid roles, for anything that uses the strong tone.
  ['on-positive', 'positive'],
  ['on-caution', 'caution'],
  ['on-limited', 'limited'],
]

const nonTextPairs: Array<[foreground: string, background: string]> = [
  // The strong tone as an icon or border on the card surface.
  ['positive', 'surface'],
  ['caution', 'surface'],
  ['limited', 'surface'],
]

describe.each<Scheme>(['light', 'dark'])('badge colours · %s', (scheme) => {
  it.each(textPairs)('%s on %s ≥ 4.5:1 (text)', (fg, bg) => {
    const ratio = contrastRatio(palette[fg]![scheme], palette[bg]![scheme])
    expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(TEXT_MIN)
  })

  it.each(nonTextPairs)('%s against %s ≥ 3:1 (non-text)', (fg, bg) => {
    const ratio = contrastRatio(palette[fg]![scheme], palette[bg]![scheme])
    expect(ratio, `${fg} against ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      NON_TEXT_MIN,
    )
  })
})

describe('badge colour wiring', () => {
  it('defines four roles for each of positive, caution and limited', () => {
    expect(Object.keys(custom)).toHaveLength(12)
  })

  it('maps every badge colour role to a Tailwind utility in index.css', () => {
    const unmapped = Object.keys(custom).filter(
      (role) => !index.includes(`--color-${role}: var(--md-custom-color-${role});`),
    )
    expect(unmapped).toEqual([])
  })
})
