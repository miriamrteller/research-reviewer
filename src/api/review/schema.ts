// The review document: the question, the AI claims, their sources with the five ADR 001 badges,
// and the review state with who acted and when. The only place that knows this API shape.
import { z } from 'zod'

const text = z.string().min(1)

export const ClaimId = text.brand<'ClaimId'>()
export type ClaimId = z.infer<typeof ClaimId>
export const SourceId = text.brand<'SourceId'>()
export type SourceId = z.infer<typeof SourceId>
export const DocumentId = text.brand<'DocumentId'>()
export type DocumentId = z.infer<typeof DocumentId>

// ADR 001: one value per group, in the order a reviewer reads a card.
export const ReferenceCheck = z.enum(['verified', 'mismatch', 'not_found'])
export type ReferenceCheck = z.infer<typeof ReferenceCheck>
export const PublicationStatus = z.enum(['peer_reviewed', 'preprint', 'concern', 'retracted'])
export type PublicationStatus = z.infer<typeof PublicationStatus>
export const ClaimSupport = z.enum(['supported', 'partial', 'unsupported'])
export type ClaimSupport = z.infer<typeof ClaimSupport>
export const Stance = z.enum(['agrees', 'disagrees', 'neutral'])
export type Stance = z.infer<typeof Stance>
export const EvidenceStrength = z.enum(['strong', 'moderate', 'limited', 'weak'])
export type EvidenceStrength = z.infer<typeof EvidenceStrength>

export const SourceBadges = z.strictObject({
  referenceCheck: ReferenceCheck,
  publicationStatus: PublicationStatus,
  claimSupport: ClaimSupport,
  stance: Stance,
  evidenceStrength: EvidenceStrength,
})
export type SourceBadges = z.infer<typeof SourceBadges>

export const Source = z.strictObject({
  id: SourceId,
  number: z.number().int().positive(),
  /** The source's reference code and where the original lives (fictional URL). */
  reference: z.strictObject({ code: text, url: z.url() }),
  title: text,
  /** Study design word shown beside the evidence strength, e.g. "Internal audit". */
  design: text,
  publisher: text,
  year: z.number().int(),
  citations: z.number().int().nonnegative(),
  badges: SourceBadges,
  /** Why a badge is lower than the source type would suggest. */
  lowered: text.optional(),
  quote: text,
  passage: text,
})
export type Source = z.infer<typeof Source>

/** Who did it and when (CLAUDE.md rule 8). */
export const Stamp = z.strictObject({ by: text, at: z.iso.datetime() })
export type Stamp = z.infer<typeof Stamp>

/** One source backing a claim, and the exact words of the claim it backs (lit on hover or focus). */
export const Citation = z.strictObject({ sourceId: SourceId, words: text })
export type Citation = z.infer<typeof Citation>

export const Claim = z
  .strictObject({
    id: ClaimId,
    text,
    citations: z.array(Citation).min(1),
    /** Present once a reviewer changed the wording: who and when. */
    edit: Stamp.optional(),
  })
  .superRefine((claim, ctx) => {
    // Edited wording may no longer contain the cited words; the sources still attach by id.
    if (claim.edit) return
    claim.citations.forEach((citation, i) => {
      if (!claim.text.includes(citation.words))
        ctx.addIssue({
          code: 'custom',
          message: 'Cited words are not in the claim text',
          path: ['citations', i, 'words'],
        })
    })
  })
export type Claim = z.infer<typeof Claim>

export const ReviewState = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('review') }),
  z.strictObject({ status: z.literal('approved'), ...Stamp.shape, note: text.optional() }),
  z.strictObject({ status: z.literal('revision_needed'), ...Stamp.shape, reason: text }),
])
export type ReviewState = z.infer<typeof ReviewState>

export const ReviewDocument = z
  .strictObject({
    id: DocumentId,
    question: text,
    caveat: text,
    claims: z.array(Claim).min(1),
    sources: z.array(Source).min(1),
    review: ReviewState,
  })
  .superRefine((doc, ctx) => {
    const sourceIds = new Set<string>()
    doc.sources.forEach((source, i) => {
      if (sourceIds.has(source.id))
        ctx.addIssue({ code: 'custom', message: 'Duplicate source id', path: ['sources', i, 'id'] })
      sourceIds.add(source.id)
    })
    const claimIds = new Set<string>()
    doc.claims.forEach((claim, i) => {
      if (claimIds.has(claim.id))
        ctx.addIssue({ code: 'custom', message: 'Duplicate claim id', path: ['claims', i, 'id'] })
      claimIds.add(claim.id)
      claim.citations.forEach(({ sourceId }, j) => {
        if (!sourceIds.has(sourceId))
          ctx.addIssue({
            code: 'custom',
            message: `Unknown source ${sourceId}`,
            path: ['claims', i, 'citations', j, 'sourceId'],
          })
      })
    })
  })
export type ReviewDocument = z.infer<typeof ReviewDocument>

// Request bodies. The server stamps the decision; edits carry the stamp made when they were saved
// on the page, because they only reach the server with the decision.
export const ClaimEdit = z.strictObject({ id: ClaimId, text, edit: Stamp })
export type ClaimEdit = z.infer<typeof ClaimEdit>
const edits = z.array(ClaimEdit).optional()
export const ApproveBody = z.strictObject({ note: text.optional(), claims: edits })
export type ApproveBody = z.infer<typeof ApproveBody>
export const ReviseBody = z.strictObject({ reason: text, claims: edits })
export type ReviseBody = z.infer<typeof ReviseBody>
