import { describe, expect, it } from 'vitest'
import { reviewFixture } from '../../mocks/fixtures/review'
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
})
