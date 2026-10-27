// Seed review document from Miriam's brief text: question, three-sentence draft summary as claims,
// three internal sources (one per claim, Miriam; source 3's full text is missing), and her uncertainty wording as the caveat. Parsed so a bad edit fails here.
// A second document (?doc=badges) gives the same sources the other badge values, so the two
// together show every ADR 001 value at least once.
import { ReviewDocument } from '../../api/review/schema'

export { REVIEWER } from '../../lib/reviewer'

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
        {
          sourceId: 'SRC-01',
          words: 'incomplete mandatory fields and inconsistent dataset naming',
        },
      ],
    },
    {
      id: 'claim-2',
      text: 'The most frequently reported impact was delayed analysis handover.',
      citations: [{ sourceId: 'SRC-02', words: 'delayed analysis handover' }],
    },
    {
      id: 'claim-3',
      text: 'The draft recommends establishing named data owners for priority datasets and introducing validation checks before data is shared for analysis.',
      citations: [
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
      quote:
        'Incomplete mandatory fields made up 42% of issues, and inconsistent dataset naming 23%.',
      passage:
        'Scope. This review covers every data-quality issue logged by the four analytics teams between the first and last working day of the quarter. Issues were raised through the shared intake form and triaged weekly by the data governance office. Duplicates were merged before counting, and issues closed as “not a data problem” were removed.\n\nMethod. Each issue was coded by two reviewers against the office’s eight-category taxonomy. Disagreements were settled in a short weekly call. The categories are mandatory fields, naming, formats, duplicates, stale extracts, access, lineage and other.\n\nFindings. Incomplete mandatory fields made up 42% of issues, and inconsistent dataset naming 23%. Most of the missing fields came from three intake forms where fields marked mandatory in the data dictionary were optional in the form itself. Format mismatches followed at 14% and duplicates at 9%. The remaining categories each accounted for less than 5%.\n\nImpact. Delayed analysis handover was the most common reported impact. Analysts reported waiting an average of four working days for a corrected extract, and two quarterly reports were published a week late. Rework was the second most reported impact, mostly re-running joins after a field was filled in.\n\nLimitations. The review counts issues that were logged; issues fixed informally by analysts are not included. Team size varies, so counts are not normalised per analyst. The coding taxonomy was introduced this quarter, so no comparison with earlier quarters is possible.\n\nNext steps. The office will align intake forms with the data dictionary, publish the monthly issue count by category, and repeat this review next quarter with the same taxonomy.',
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
      quote: 'The most common effect was delayed analysis handover.',
      passage:
        'Background. The analytics platform team held a two-hour retrospective after a quarter in which several projects reported time lost to finding the right dataset. Eleven analysts and three engineers took part. Notes were taken by a facilitator from outside the team.\n\nWhat went wrong. Inconsistent dataset naming caused repeated discovery and reconciliation work. The most common effect was delayed analysis handover. The same extract appeared under three names in two storage areas, and analysts could not tell which was current. Participants described spending the first morning of most projects confirming which table to use, and two projects joined to a superseded copy before the error was noticed.\n\nWhy it happened. No one owned the naming of shared datasets. Each team created copies with local prefixes, and the catalogue entry was written once and never updated. Retired datasets were renamed rather than removed, which left several near-identical names in place.\n\nWhat went well. Where a named person owned a dataset, questions were answered within a day and the catalogue entry was kept up to date. Participants pointed to the customer reference tables as an example to copy.\n\nActions. The review recommends a shared naming convention and named dataset owners. The team will draft the convention within a month, assign owners to the ten most-used datasets first, and archive superseded copies after a two-week notice period.\n\nCaveats. This is a single team’s view and was not checked against usage logs. Time lost was estimated by participants rather than measured.',
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
      // No passage: the full text could not be found (Miriam), so the card shows a minor error.
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
