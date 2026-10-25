// Which claims and sources light up together. Pure: links by claim id and citation number only.
export type Focused = { kind: 'claim'; id: string } | { kind: 'source'; number: number } | null

type ClaimLink = { id: string; sourceNumbers: readonly number[] }

export function isClaimLit(claim: ClaimLink, focused: Focused): boolean {
  if (focused === null) return false
  if (focused.kind === 'claim') return focused.id === claim.id
  return claim.sourceNumbers.includes(focused.number)
}

export function isSourceLit(
  number: number,
  claims: readonly ClaimLink[],
  focused: Focused,
): boolean {
  if (focused === null) return false
  if (focused.kind === 'source') return focused.number === number
  return claims.some((c) => c.id === focused.id && c.sourceNumbers.includes(number))
}

// Splits a passage around its quoted excerpt so the excerpt can be marked. No match: no mark.
// A quote that ends a sentence may continue in the passage, so trailing punctuation is ignored.
export function splitPassage(passage: string, quoted: string) {
  const quote = quoted.replace(/[.!?]+$/, '')
  const at = passage.indexOf(quote)
  if (at < 0) return { before: passage, quote: '', after: '' }
  return { before: passage.slice(0, at), quote, after: passage.slice(at + quote.length) }
}

// The chevron of a source card, so a citation number can move focus to it.
export function sourceTriggerId(number: number) {
  return `source-${number}-trigger`
}
