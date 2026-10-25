import { describe, expect, it } from 'vitest'
import { isClaimLit, isSourceLit, splitPassage } from './highlight'

const claims = [
  { id: 'c1', sourceNumbers: [1, 2] },
  { id: 'c2', sourceNumbers: [2] },
]

describe('claim and source highlight', () => {
  it('lights the sources a focused claim cites', () => {
    const focused = { kind: 'claim', id: 'c1' } as const
    expect([1, 2, 3].map((n) => isSourceLit(n, claims, focused))).toEqual([true, true, false])
  })

  it('lights every claim a focused source supports', () => {
    const focused = { kind: 'source', number: 2 } as const
    expect(claims.map((c) => isClaimLit(c, focused))).toEqual([true, true])
  })

  it('marks the quote inside the passage, ignoring its closing full stop', () => {
    expect(splitPassage('A b c, d.', 'b c.')).toEqual({ before: 'A ', quote: 'b c', after: ', d.' })
  })
})
