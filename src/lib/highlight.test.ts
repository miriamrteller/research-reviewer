import { describe, expect, it } from 'vitest'
import { isSourceLit, litCitations, segmentClaim, splitPassage } from './highlight'

const claims = [
  {
    id: 'c1',
    citations: [
      { number: 1, words: 'a b' },
      { number: 2, words: 'd' },
    ],
  },
  { id: 'c2', citations: [{ number: 2, words: 'x' }] },
]

describe('claim and source highlight', () => {
  it('lights the sources a focused claim cites', () => {
    const focused = { kind: 'claim', id: 'c1' } as const
    expect([1, 2, 3].map((n) => isSourceLit(n, claims, focused))).toEqual([true, true, false])
  })

  it('lights only the words a focused source backs', () => {
    const lit = litCitations(claims[0]!, { kind: 'source', number: 2 })
    expect(segmentClaim('a b c d e', lit)).toEqual([
      { text: 'a b c ', lit: false },
      { text: 'd', lit: true },
      { text: ' e', lit: false },
    ])
  })

  it('marks the quote inside the passage, ignoring its closing full stop', () => {
    expect(splitPassage('A b c, d.', 'b c.')).toEqual({ before: 'A ', quote: 'b c', after: ', d.' })
  })
})
