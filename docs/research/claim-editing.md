# Editing AI claims in a review screen: industry practice

Research note for `research-reviewer`, written 2026-10-25. Scope: a reviewer reads AI-generated
claims, each with source cards and citation numbers, and may change a claim's wording before
approving it. This note states what current practice says the edit should do, recommends the
smallest flow worth 20 minutes, and lists what to leave out. Dated links are in the sources
section.

## 1. Inline, not a dialog

Edit in place when the text is short and the reviewer must compare it with context on the page.
A modal is for a single-purpose task, a required answer, or confirming an action that cannot be
reverted; it is not for editing something the user needs to see against the page behind it
(GitLab, Sept 2026; PatternFly v5). AI approval-workflow guidance agrees: editing is a first-class
state and edit-in-place beats "approve first, fix later" (AI UX Playground, July 2026). The
Editage checklist (Aug 2026) adds that the original and edited sentence should be read side by
side.

Two inline styles exist (PatternFly): field edit (pencil beside one value, tick and cross) for one
small value, and block edit (one Edit button opens every field, one Save and one Cancel) for
fields that change together. Claims are read as one text, so block edit fits.

## 2. What an edit keeps and what it invalidates

Sources attach to a claim by id, not by character position, so source cards and citation numbers
stay attached and in order. What an edit invalidates is the _judgement_ that a source supports the
wording. A check covers only the version checked: in July 2026 a Connecticut lawyer verified every
citation, let an AI tool edit the drafts, nobody rechecked, and the court ordered training and
donations (written up Aug 2026). Editage (Aug 2026) says the same for science: after an edit,
confirm the cited source still supports the revised wording.

| Badge group                                                               | After an edit                               |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| Facts about the source (reference check, publication status)              | Still valid                                 |
| Facts about source and wording (claim support, stance, evidence strength) | Computed for the AI text; needs re-checking |
| Citation numbers                                                          | Unchanged                                   |

Practice: mark the claim as edited wherever its support badges are read, so the reviewer knows
those badges describe the earlier text, and re-verify after the final edit.

## 3. Approve after edit

Consent applies to the edited text, not the original draft (AI UX Playground, July 2026).
Human-in-the-loop guidance adds a cognitive forcing function at the approve step, such as a
required reason or an explicit confirmation, against automation bias (Zartis, June 2026). So:

1. Approve sends the current wording.
2. Approve is unavailable while edits are unsaved, so what is approved is what is on the page.
3. If any claim was edited, the confirmation says so ("2 of 3 claims edited").

## 4. Who edited and when

Collaborative tools show "Last updated by Alice at 22/05/2025, 12:00" next to the changed field,
derived from the newest edit's author and time (Jazz, May 2025). Show one short line under an
edited claim, beside the "Edited" mark; unedited claims show nothing.

## 5. Empty and unchanged edits

- **Empty.** Keep Save enabled and show an inline error linked to the field, rather than a
  disabled button that explains nothing (Basis design system, 2026).
- **Unchanged.** The one accepted exception to "never disable" is Save on a form with no
  changes (same source). The alternative, Save with no changes just closes the form, needs no
  disabled state. Compare trimmed text so whitespace does not count as a change.

## 6. Undo and revert

Microsoft's HAX guideline 9, "Support efficient correction", lists "Rich and detailed edits" and
"Undo automated actions" (Oct 2023). The cheapest form in a review screen is one action, **Revert
to AI text** per claim, not an undo stack. Escape is the second undo, and Atlassian's Jira issue
(2016 to 2022, 43 votes) shows the trap: Escape that silently drops unsaved text loses work.
Either Escape only closes when nothing changed, or it asks first.

## 7. Keyboard and screen reader

- **In.** Edit is a real button. On activation focus moves to the first textarea. Each textarea
  has a visible label ("Claim 1 of 3") and is described by its source cards by id.
- **Out.** After Save or Discard the textareas vanish. The W3C dialog pattern rule applies to any
  control that disappears: return focus to the element that opened it, or if it is gone, to the
  element that continues the workflow. Never leave focus on `body`.
- **Announce.** One polite live region says "Changes saved. 2 claims edited, not approved yet."
  Reuse the same element so it is one region updating.
- **Sticky bars.** WCAG 2.2 SC 2.4.11 Focus Not Obscured (June 2026) names sticky footers as the
  typical failure. The last textarea must not scroll under the Approve bar: bottom padding and
  `scroll-padding` equal to the bar height.
- **Names.** Per-claim controls carry what they act on, as check-answers Change links do (NHS,
  June 2026): "Revert claim 2 to AI text", not "Revert".

## 8. What to record

| Field                | Value                                              | Why                                    |
| -------------------- | -------------------------------------------------- | -------------------------------------- |
| `claim.id`           | unchanged                                          | Sources attach by id                   |
| `claim.originalText` | AI wording, never changed                          | Revert; comparison for the Edited mark |
| `claim.text`         | current wording                                    | What Approve sends                     |
| `claim.edit`         | `{ by, at }`, ISO 8601 UTC, only when text differs | Who and when, shown in the UI          |
| `approval.claims[]`  | `{ id, text, editedAt? }`                          | Consent is to this wording             |

Before and after are the two text fields. A history, if ever added, is a list of `{ text, by, at }`
per claim, newest first, the shape Jazz and audit logs use.

## 9. Risks

- **Approve changes meaning.** Before editing it means "the AI text and its sources are fine".
  After, it means "my text is fine and I checked the sources still support it". The confirmation
  line makes that explicit; without it a reviewer approves stale badges unnoticed.
- **Approving while editing.** If Approve stays enabled during editing, the old text is approved
  while new text is on screen.
- **Lost work.** Reload or Escape with unsaved edits. A `beforeunload` warning is cheap.
- **Edited read as warning.** Amber or red on an edited claim says "problem". Use a neutral
  outline and the word "Edited".

## Recommendation: the smallest flow worth 20 minutes

1. One **Edit** button opens one form: a textarea per claim, labelled "Claim n of N", described by
   its source cards, focus in the first.
2. **Save** and **Discard**. Save checks non-empty, trims, compares to the original, stores
   `{ by, at }` on changed claims, closes the form, returns focus to Edit, announces "Changes saved".
3. An **Edited** mark with a neutral outline and "Edited by X, 25 Oct 2026 11:40" on changed claims.
4. **Approve** unavailable while the form is open; the confirmation names how many claims were
   edited.

## What to leave out, and why

| Leave out                                 | Why it is safe to skip                                                                                                                                                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Versioning and edit history               | Practice records before and after; a version list is only needed once more than one person edits or an audit is required. Record `originalText` and `{ by, at }` now so history can be added later without a migration. |
| Multi-step undo and redo                  | Revert to AI text covers the one case that matters. An undo stack is state the reviewer cannot see.                                                                                                                     |
| Per-claim Save                            | Claims are approved together, so one Save matches one Approve. Per-claim Save doubles the states.                                                                                                                       |
| Re-computing support badges after an edit | Needs a backend. Marking the claim Edited is the practice until then.                                                                                                                                                   |
| Add, delete, split or merge claims        | Changes the claim set the sources attach to; a different feature.                                                                                                                                                       |
| Rich text                                 | Claims are plain sentences; a rich editor adds a dependency and a11y work.                                                                                                                                              |
| Escape confirmation dialog                | Escape that only closes when unchanged is enough with a Discard button.                                                                                                                                                 |
| `beforeunload` warning                    | Cheap, but one tab and one sitting; add if time remains.                                                                                                                                                                |

## Open decisions (default first)

| Decision              | Default                         | Alternative                           |
| --------------------- | ------------------------------- | ------------------------------------- |
| Edit granularity      | One form for all claims         | Edit per claim                        |
| Unchanged Save        | Closes with no Edited mark      | Save disabled                         |
| Empty claim           | Inline error, Save enabled      | Save disabled                         |
| Escape with changes   | Does nothing (Discard does it)  | Asks first                            |
| Revert to AI text     | First thing if time remains     | Build now                             |
| Approve while editing | Disabled, reason in live region | Hidden                                |
| Badges after edit     | Edited mark only                | "For AI text" label on support badges |

## States and transitions

| State           | Reviewer sees                                                                 | Transitions                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reading         | Claims as text; Edit, Approve, Send back enabled                              | Edit → Editing; Approve → Confirming; Send back → Reason                                                                                            |
| Editing         | Textareas, Save, Discard; Approve and Send back disabled; "Edits are unsaved" | Save (valid, changed) → Reading, edited; Save (unchanged) → Reading; Save (empty) → Editing with error; Discard, or Escape when unchanged → Reading |
| Reading, edited | As Reading plus Edited mark and by/at; "Changes not approved yet"             | Edit → Editing (draft from current text); Revert → Reading; Approve → Confirming (names edited count)                                               |
| Confirming      | Approve dialog, focus on title; Escape returns focus to Approve               | Confirm → Approved; Cancel → previous state                                                                                                         |
| Approved        | Read-only, approved by/at, Edit hidden                                        | none                                                                                                                                                |
| Revision needed | Read-only, reason and by/at                                                   | none                                                                                                                                                |

Loading and error are query states, not rows here; the form never opens while the document is
loading or failed.

## Sources

- GitLab Design System, Modal: when a modal is right and when inline is better; focus and
  destructive confirmations. Updated 15 Sept 2026. https://design.gitlab.com/components/modal
- PatternFly v5 (5.4.2), Inline edit design guidelines: field, row and full-page edit; save and
  cancel. https://v5-archive.patternfly.org/components/inline-edit/design-guidelines
- AI UX Playground, Approval workflows: states, editing as first-class, consent to the edited
  payload, anti-patterns. Updated 10 July 2026. https://www.aiuxplayground.com/pattern/approval-workflows
- Zartis, "Human-in-the-Loop UI Patterns: Designing Intentional Friction for Safer AI Products".
  11 June 2026. https://www.zartis.com/human-in-the-loop-ui-patterns-designing-intentional-friction-for-safer-ai-products/
- Editage, "How to verify an AI-edited manuscript": re-check citations against revised wording.
  12 Aug 2026. https://www.editage.com/blog/how-to-verify-an-ai-edited-manuscript-checks-for-hallucinations-flow-and-scientific-writing-quality/
- Vibe Graveyard, "ChatGPT rewrote verified citations in Connecticut Supreme Court briefs".
  28 Aug 2026. https://vibegraveyard.ai/story/glg-law-chatgpt-verified-citations-rewritten/
- Microsoft HAX Toolkit, Guideline 9 "Support efficient correction", patterns 9B and 9C.
  Updated 17 Oct 2023. https://www.microsoft.com/en-us/haxtoolkit/library/pattern/11/
- Jazz, History patterns: per-edit `by` and `madeAt`, "last updated by". Example dated
  22 May 2025. https://jazz.tools/docs/react-native/design-patterns/history-patterns
- Basis Design System, Disabled buttons: enabled by default with inline errors; disabled Save on
  an unchanged form is the exception. 2026. https://design.basis.com/patterns/disabled-buttons
- Atlassian Jira JRACLOUD-61439, "Prompt user before clearing changed values when ESC key is
  pressed during inline edit". 14 June 2016 to 20 Sept 2022. https://jira.atlassian.com/browse/JRACLOUD-61439
- W3C WAI ARIA Authoring Practices, Dialog (Modal) pattern: focus return.
  https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
- W3C, Understanding SC 2.4.11 Focus Not Obscured (Minimum). Updated 15 June 2026.
  https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured.html
- NHS digital service manual, Check answers: Change links with hidden text. Updated June 2026.
  https://service-manual.nhs.uk/design-system/patterns/check-answers
