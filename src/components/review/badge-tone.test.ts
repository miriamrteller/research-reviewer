// Each value in a badge group gets its own colour (CLAUDE.md "Each value gets its own badge").
import { describe, expect, it } from 'vitest'
import { badgeTone } from './badge-tone'

const groups: Record<string, string[]> = {
  'Reference check': ['Verified', 'Details differ', 'Not found'],
  'Publication status': ['Peer reviewed', 'Preprint', 'Concern raised', 'Retracted'],
  'Claim support': ['Supported', 'Partly supported', 'Not supported'],
  Stance: ['Agrees', 'Disagrees', 'Neutral'],
  'Evidence strength': ['Strong', 'Moderate', 'Limited', 'Weak'],
}

describe.each(Object.entries(groups))('%s badges', (_group, labels) => {
  it('give every value a different colour', () => {
    const tones = labels.map(badgeTone)
    expect(new Set(tones).size).toBe(labels.length)
  })
})

it('keeps amber for "needs attention" and orange only for Limited', () => {
  expect(badgeTone('Details differ')).toBe('caution')
  expect(badgeTone('Concern raised')).toBe('caution')
  expect(badgeTone('Limited')).toBe('limited')
})
