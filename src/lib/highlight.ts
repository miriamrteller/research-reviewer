// Which claims and sources light up together. Pure: links by claim id and citation number only;
// each citation names the words of the claim it backs, and only those words light up.
export type Focused = { kind: 'claim'; id: string } | { kind: 'source'; number: number } | null

type Citation = { number: number; words: string }
type ClaimLink = { id: string; citations: readonly Citation[] }

// The citations of a claim lit now: all of them for the claim in focus, or the focused source's.
export function litCitations(claim: ClaimLink, focused: Focused): Citation[] {
  if (focused === null) return []
  if (focused.kind === 'claim') return focused.id === claim.id ? [...claim.citations] : []
  return claim.citations.filter((c) => c.number === focused.number)
}

export function isSourceLit(
  number: number,
  claims: readonly ClaimLink[],
  focused: Focused,
): boolean {
  if (focused === null) return false
  if (focused.kind === 'source') return focused.number === number
  return claims.some((c) => c.id === focused.id && c.citations.some((n) => n.number === number))
}

// Splits claim text into runs, marking the runs that are lit citation words.
export function segmentClaim(text: string, lit: readonly Citation[]) {
  const runs: { text: string; lit: boolean }[] = []
  let rest = text
  const ordered = lit
    .map((c) => ({ words: c.words, at: text.indexOf(c.words) }))
    .filter((c) => c.at >= 0)
    .sort((a, b) => a.at - b.at)
  for (const { words } of ordered) {
    const at = rest.indexOf(words)
    if (at < 0) continue
    if (at > 0) runs.push({ text: rest.slice(0, at), lit: false })
    runs.push({ text: words, lit: true })
    rest = rest.slice(at + words.length)
  }
  if (rest) runs.push({ text: rest, lit: false })
  return runs
}

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
