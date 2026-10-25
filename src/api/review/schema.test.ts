import { describe, expect, it } from 'vitest'
import { badgesFixture, reviewFixture } from '../../mocks/fixtures/review'
import { badgeLooks } from '../../components/review/badges'
import { ReviewDocument } from './schema'

describe('ReviewDocument schema', () => {
  it('parses the seed fixture', () => {
    expect(ReviewDocument.safeParse(reviewFixture).success).toBe(true)
  })

  it('rejects a claim that cites a source that does not exist', () => {
    const bad = {
      ...reviewFixture,
      claims: [{ ...reviewFixture.claims[0], sourceIds: ['SRC-99'] }],
    }
    const result = ReviewDocument.safeParse(bad)
    expect(result.error?.issues[0]?.path).toEqual(['claims', 0, 'sourceIds', 0])
  })

  it('rejects an approval without who and when', () => {
    const result = ReviewDocument.safeParse({ ...reviewFixture, review: { status: 'approved' } })
    expect(result.error?.issues[0]?.path).toEqual(['review', 'by'])
  })

  it('shows every badge value at least once across the two fixtures', () => {
    const shown = [reviewFixture, badgesFixture].flatMap((doc) =>
      doc.sources.flatMap((source) => Object.entries(source.badges).map(([g, v]) => `${g}.${v}`)),
    )
    const every = Object.entries(badgeLooks).flatMap(([g, values]) =>
      Object.keys(values).map((v) => `${g}.${v}`),
    )
    expect(every).toHaveLength(17)
    expect(every.filter((value) => !shown.includes(value))).toEqual([])
  })

  it('quotes every source word for word from its passage', () => {
    for (const source of reviewFixture.sources) {
      expect(source.passage).toContain(source.quote.replace(/\.$/, ''))
    }
  })
})
