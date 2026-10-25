// The edit draft for the claims: local state on the review screen (never copied from the query).
// Saved edits stay on the page only, stamped with who and when, until Approve or Revise sends them.
import { useState } from 'react'
import type { Claim, ClaimEdit, ClaimId } from '../api/review/schema'
import { REVIEWER } from '../lib/reviewer'

type Drafts = Readonly<Record<string, string>>

export function useClaimEdits(claims: readonly Claim[]) {
  const [saved, setSaved] = useState<ReadonlyMap<ClaimId, ClaimEdit>>(new Map())
  const [drafts, setDrafts] = useState<Drafts | null>(null)
  const [empty, setEmpty] = useState<ReadonlySet<ClaimId>>(new Set())

  // What the page shows: the saved edit if there is one, else the claim as delivered.
  const shown = claims.map((claim) => {
    const edit = saved.get(claim.id)
    return edit ? { ...claim, text: edit.text, edit: edit.edit } : claim
  })

  function start() {
    setDrafts(Object.fromEntries(shown.map((claim) => [claim.id, claim.text])))
    setEmpty(new Set())
  }

  function change(id: ClaimId, text: string) {
    setDrafts((current) => ({ ...current, [id]: text }))
  }

  function discard(): boolean {
    setDrafts(null)
    setEmpty(new Set())
    return true
  }

  /** Trims, refuses empty claims, and stamps only the claims whose wording changed. */
  function save(): boolean {
    if (!drafts) return true
    const blank = claims.filter((claim) => !(drafts[claim.id] ?? '').trim()).map((c) => c.id)
    if (blank.length > 0) {
      setEmpty(new Set(blank))
      return false
    }
    const next = new Map(saved)
    const at = new Date().toISOString()
    for (const claim of claims) {
      const text = (drafts[claim.id] ?? '').trim()
      const before = saved.get(claim.id)
      if (text === claim.text) next.delete(claim.id)
      else if (text !== before?.text)
        next.set(claim.id, { id: claim.id, text, edit: { by: REVIEWER, at } })
    }
    setSaved(next)
    setDrafts(null)
    setEmpty(new Set())
    return true
  }

  return {
    shown,
    editing: drafts !== null,
    drafts: drafts ?? {},
    empty,
    edits: [...saved.values()],
    start,
    change,
    discard,
    save,
  }
}
