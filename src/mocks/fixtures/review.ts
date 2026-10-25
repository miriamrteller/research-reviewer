// Seed review document from Miriam's brief text: question, three-sentence draft summary as claims,
// three internal sources, and her uncertainty wording as the caveat. Parsed so a bad edit fails here.
// A second document (?doc=badges) gives the same sources the other badge values, so the two
// together show every ADR 001 value at least once.
import { ReviewDocument } from '../../api/review/schema'

/** The fictional reviewer. The mock has no sign-in, so every write is stamped with this name. */
export const REVIEWER = 'Prof. I. C. Everything'

export const reviewFixture = ReviewDocument.parse({
  id: 'DOC-DQ-01',
  question:
    'Summarise the recurring data-quality issues reported this quarter and suggest next steps.',
  caveat:
    'The recommendations are based on three internal review documents. Confirm that they apply to the specific dataset and workflow before acting.',
  claims: [
    {
      id: 'claim-1',
      text: 'Data-quality issues this quarter were concentrated in incomplete mandatory fields and inconsistent dataset naming.',
      citations: [
        { sourceId: 'SRC-01', words: 'incomplete mandatory fields' },
        { sourceId: 'SRC-02', words: 'inconsistent dataset naming' },
      ],
    },
    {
      id: 'claim-2',
      text: 'The most frequently reported impact was delayed analysis handover.',
      citations: [{ sourceId: 'SRC-01', words: 'delayed analysis handover' }],
    },
    {
      id: 'claim-3',
      text: 'The draft recommends establishing named data owners for priority datasets and introducing validation checks before data is shared for analysis.',
      citations: [
        { sourceId: 'SRC-02', words: 'establishing named data owners for priority datasets' },
        {
          sourceId: 'SRC-03',
          words: 'introducing validation checks before data is shared for analysis',
        },
      ],
    },
  ],
  sources: [
    {
      id: 'SRC-01',
      number: 1,
      reference: { code: 'SRC-01', url: 'https://example.org/sources/SRC-01' },
      title: 'Quarterly Data Quality Review',
      design: 'Quarterly audit',
      publisher: 'Data Governance Office',
      year: 2026,
      citations: 12,
      badges: {
        referenceCheck: 'verified',
        publicationStatus: 'peer_reviewed',
        claimSupport: 'supported',
        stance: 'agrees',
        evidenceStrength: 'moderate',
      },
      quote: 'Incomplete mandatory fields accounted for 42% of recorded data-quality issues.',
      passage:
        'Incomplete mandatory fields accounted for 42% of recorded data-quality issues. Delayed analysis handover was the most common reported impact.',
    },
    {
      id: 'SRC-02',
      number: 2,
      reference: { code: 'SRC-02', url: 'https://example.org/sources/SRC-02' },
      title: 'Dataset Naming Retrospective',
      design: 'Team retrospective',
      publisher: 'Analytics Platform Team',
      year: 2026,
      citations: 4,
      badges: {
        referenceCheck: 'verified',
        publicationStatus: 'preprint',
        claimSupport: 'supported',
        stance: 'agrees',
        evidenceStrength: 'limited',
      },
      quote: 'Inconsistent dataset naming caused repeated discovery and reconciliation work.',
      passage:
        'Inconsistent dataset naming caused repeated discovery and reconciliation work. The review recommends a shared naming convention and named dataset owners.',
    },
    {
      id: 'SRC-03',
      number: 3,
      reference: { code: 'SRC-03', url: 'https://example.org/sources/SRC-03' },
      title: 'Data Sharing Readiness Checklist',
      design: 'Guidance checklist',
      publisher: 'Data Sharing Working Group',
      year: 2025,
      citations: 2,
      badges: {
        referenceCheck: 'verified',
        publicationStatus: 'preprint',
        claimSupport: 'partial',
        stance: 'neutral',
        evidenceStrength: 'weak',
      },
      lowered:
        'it is a checklist that states the benefit without data, and it does not mention named data owners.',
      quote: 'Validation checks before analytical handover reduce avoidable rework.',
      passage:
        'Validation checks before analytical handover reduce avoidable rework and clarify readiness expectations.',
    },
  ],
  review: { status: 'review' },
})

const allOtherBadges = {
  'SRC-01': {
    referenceCheck: 'mismatch',
    publicationStatus: 'concern',
    claimSupport: 'unsupported',
    stance: 'disagrees',
    evidenceStrength: 'strong',
  },
  'SRC-02': {
    referenceCheck: 'not_found',
    publicationStatus: 'retracted',
    claimSupport: 'supported',
    stance: 'agrees',
    evidenceStrength: 'moderate',
  },
  'SRC-03': {
    referenceCheck: 'verified',
    publicationStatus: 'peer_reviewed',
    claimSupport: 'partial',
    stance: 'neutral',
    evidenceStrength: 'weak',
  },
} as const

/** Same answer, other badge values: the badge values ?doc=badges shows. */
export const badgesFixture = ReviewDocument.parse({
  ...reviewFixture,
  sources: reviewFixture.sources.map((source) => ({
    ...source,
    badges: allOtherBadges[source.id as keyof typeof allOtherBadges],
  })),
})

export const reviewFixtures = { default: reviewFixture, badges: badgesFixture }
export type FixtureName = keyof typeof reviewFixtures
