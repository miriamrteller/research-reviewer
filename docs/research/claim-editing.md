# Editing AI claims in a review screen: how the edit flow should work

Research note for `research-reviewer`, written 2026-10-25. Scope: a reviewer reads AI-generated
claims, each with source cards and citation numbers, and may change a claim's wording before
approving it or sending it back. This note collects current practice on how that edit should
behave, then recommends the smallest flow worth building in 20 minutes. Links and dates are in the
sources section. It does not reuse earlier builds.

Standing assumptions from the README that this note respects: one reviewer, one tab, no backend,
no edit history, and the reviewer is qualified to edit the text and trusted to check the sources.

## 1. Inline or dialog

Current practice is clear: edit in place when the text is short and the context (the sources)
must stay visible. A dialog is for a single-purpose task, a required answer, or confirming an
action that cannot be reverted; it is not for changing text the user needs to compare against the
page behind it (GitLab modal guidance, Sept 2026; PatternFly inline edit, v5). Approval-workflow
guidance for AI output says the same: editing is a first-class state, and edit-in-place beats
"approve first, fix later" (AI UX Playground, July 2026). The Editage checklist (Aug 2026) adds that
the reviewer should read the original and edited sentence side by side, which a dialog hides.

**Takeaway:** the claim text turns into a textarea where it sits, sources stay beside it. Dialogs
are kept for the Approve confirmation only.

Two inline styles exist. Field-specific edit (pencil beside one field, tick and cross to finish) is
for one small value; full-page edit (one Edit button switches the whole block, Save and Cancel end
it) is for several fields that change together (PatternFly). Claims are two or three related
paragraphs that the reviewer reads as one text, so the full-block style fits better: one Edit
button, every claim becomes a textarea, one Save and one Discard.

## 2. What an edit keeps and what it invalidates

Nothing in the data model needs to change when wording changes. Sources attach to the claim by id,
not by character offset, so source cards and citation numbers stay attached and keep their order.
What changes is whether they are still _true_ of the new wording.

The evidence that this matters is recent and concrete. A Connecticut lawyer verified every citation,
then let an AI tool edit the drafts; the tool changed authorities after the check, nobody rechecked,
and the court ordered training and donations (July 2026 incident, written up Aug 2026). The lesson
stated there: a source check covers only the version that was checked, and re-verification belongs
after the final substantive edit. Editage's manuscript checklist (Aug 2026) says the same for
science: after an edit, confirm the cited source still supports the revised wording, because small
word substitutions change meaning.

So the question "do the badges stay valid?" has two parts:

| Part                                                                        | After an edit                                  |
| --------------------------------------------------------------------------- | ---------------------------------------------- |
| Reference check, publication status (facts about the source itself)         | Still valid. The source did not change.        |
| Claim support, stance, evidence strength (facts about source _and_ wording) | Computed for the AI's wording. Not re-checked. |
| Citation numbers                                                            | Stay. They are ids, not positions.             |

The README decides that the reviewer is trusted to check sources, so the screen marks the claim
"Edited" and does not warn. That is a scope decision, not a UX finding: practice says the system
should at least make the edited state visible wherever the support badges are read, so the
reviewer knows those badges describe the earlier text.

## 3. Approve after edit

"Consent applies to the edited payload, not the original draft" (AI UX Playground, July 2026).
Human-in-the-loop guidance adds a cognitive forcing function at the approve step, such as a
required reason or a confirmation, to counter automation bias (Zartis, June 2026). Three rules
follow:

1. Approve sends the current wording, never the AI original.
2. Approve is not available while edits are unsaved. The reviewer must save or discard first, so
   what is approved is what is on the page.
3. If any claim was edited, the confirmation says so in one line ("2 of 3 claims edited") so the
   approval is knowingly of the edited text.

Send back for revision does not depend on edits; its payload is the reason, and the claims as they
stand.

## 4. Showing who edited and when

Collaborative tools show "Last updated by Alice at 22/05/2025, 12:00" next to the changed field,
derived from the newest edit's author and time (Jazz history patterns, example dated May 2025).
The project rule is the same: every write stores `{ by, at }` and the UI shows it. For a one-user
prototype the name is the fixed reviewer and the time is when Save was pressed.

Keep it to one short line under the edited claim, next to the "Edited" mark, and show the same
fact once (project rule: show each fact once). An unedited claim shows nothing.

## 5. Preventing empty or unchanged edits

- **Empty.** A claim with no text is invalid. Keep Save enabled and show an inline error linked to
  the field with `aria-describedby`, rather than silently disabling Save (Basis design system,
  disabled-button guidance, 2026). An enabled button that explains the problem beats one that does
  nothing.
- **Unchanged.** The one accepted exception to "never disable" is a Save on a form with no
  changes, where a disabled Save signals "nothing changed" (same source). Alternative: Save with
  no changes just closes the form with no "Edited" mark. Either is fine; the second needs no
  disabled state and keeps keyboard parity simple.
- **Whitespace-only change.** Compare trimmed text with the original. If equal, treat as
  unchanged, so a trailing space does not mark a claim "Edited".

## 6. Undo and revert to the AI original

Microsoft's HAX guideline 9, "Support efficient correction", lists "Rich and detailed edits" (9B)
and "Undo automated actions" (9C) as patterns (toolkit updated Oct 2023). In a review screen the
cheapest form is not a multi-step undo stack but one action: **Revert to AI text** on an edited
claim, which sets the draft back to `originalText` and clears the Edited mark. Multi-step undo and
redo stay cut (README: no edit history).

Escape while editing is the second undo. Atlassian's long-running Jira issue (reported 2016, 43
votes, closed as duplicate 2022) shows the trap: Escape that silently throws away unsaved text
loses work. Two safe choices: Escape only cancels when nothing changed, or Escape asks before
discarding. The first is simpler and still gives keyboard parity because Discard is a button.

## 7. Keyboard and screen reader

- **Entering edit.** Edit button is a real `button`. On activation, focus moves into the first
  textarea. Each textarea has a visible label ("Claim 1 of 3") and is described by its own source
  cards by id, so a screen reader hears what the sources are before typing.
- **Leaving edit.** After Save or Discard the textareas disappear. The W3C dialog pattern rule
  applies to any control that vanishes: return focus to the element that opened it, or, if that
  element is gone, to the element that continues the workflow. Here the Edit button still exists,
  so focus returns to it. Never leave focus on `body` (project rule: focus is managed, never
  dropped).
- **Announcing the result.** Saving changes the page silently otherwise. Use one polite live
  region (`<output>`) that says "Changes saved. 2 claims edited, not approved yet." Reuse the same
  element for later messages so it is one region updating, not a new one appearing.
- **Escape.** Closes edit mode when nothing changed (see section 6). Otherwise does nothing, or
  moves focus to Discard, which names what it will do.
- **Sticky bar.** The Approve and Send back bar is sticky, and WCAG 2.2 SC 2.4.11 "Focus not
  obscured (minimum)" (understanding page updated June 2026) names sticky footers as the typical
  failure. The last textarea must not scroll under the bar: give the scroll box bottom padding
  and `scroll-padding` equal to the bar height, and keep the keyboard e2e test that tabs the page.
- **Change links in summary pages** (NHS and GOV.UK check-answers pattern, June 2026) carry hidden
  text naming what they change. Apply the same to any per-claim control: "Revert claim 2 to AI
  text", not "Revert".

## 8. What to record

For one user with no backend the record is small but should still be the right shape, so the
real backend can keep it:

| Field                | Value                                                              | Why                                        |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| `claim.id`           | unchanged                                                          | Sources attach by id                       |
| `claim.originalText` | AI wording, never changed                                          | Revert, and comparison for the Edited mark |
| `claim.text`         | current wording                                                    | What Approve sends                         |
| `claim.edit`         | `{ by, at }`, `at` as ISO 8601 UTC, present only when text differs | Who and when, shown in the UI              |
| `approval.claims[]`  | `{ id, text, editedAt? }`                                          | Consent is to this wording                 |

Before and after are the two text fields. There is no list of intermediate versions (README). If a
history is added later it is a list of `{ text, by, at }` per claim, newest first, which is the shape
Jazz and most audit logs use.

## 9. Risks

- **Approve changes meaning once edits exist.** Before editing, Approve means "the AI text and its
  sources are fine". After an edit it means "my text is fine, and I checked the sources still
  support it". The confirmation line in section 3 makes the second meaning explicit. Without it a
  reviewer can approve stale badges without noticing.
- **Unsaved edits at Approve.** If Approve stays enabled during editing, the reviewer may approve
  the old text while new text is on screen. Disable or hide Approve while the form is open, and say
  why in the live region.
- **Leaving the page.** Unsaved edits are lost on reload. A `beforeunload` warning is cheap.
- **Edited state read as warning.** Amber or red tint on an edited claim says "problem". Use a
  neutral outline and the word "Edited" (project colour rule).
- **Scope creep.** Per-claim save, add or delete claims, rich text, version history and span-level
  source highlighting all multiply states. None are in the README.

## Recommendation: the smallest edit flow worth 20 minutes

Build one block-level edit:

1. One **Edit** button at the top of the claims block. It opens one form with a borderless textarea
   per claim, labelled "Claim n of N", described by that claim's source cards, focus in the first.
2. **Save** and **Discard** buttons in the same spot. Save validates non-empty, trims, compares to
   `originalText`, stores `{ by, at }` on changed claims, closes the form, returns focus to Edit,
   announces "Changes saved".
3. An **Edited** mark with a neutral outline and "Edited by Reviewer, 25 Oct 2026 11:40" on each
   changed claim.
4. **Approve** disabled while the form is open; the confirmation names how many claims were
   edited.

Leave out: per-claim Revert, Escape handling beyond "close when unchanged", `beforeunload`,
history. Add Revert first if time remains, because it is one button and one line of state.

## Open decisions for Miriam (with a default)

| Decision                  | Options                                    | Default                             |
| ------------------------- | ------------------------------------------ | ----------------------------------- |
| Edit granularity          | one form for all claims / Edit per claim   | One form for all claims             |
| Unchanged Save            | disabled Save / Save closes with no mark   | Save closes with no mark            |
| Empty claim               | inline error, Save enabled / Save disabled | Inline error, Save enabled          |
| Escape with changes       | nothing / confirm / discard                | Nothing (Discard button does it)    |
| Revert to AI text         | build now / later                          | Later, first thing if time remains  |
| Approve while editing     | hidden / disabled with reason              | Disabled with reason in live region |
| Support badges after edit | leave as is / mark "for AI text"           | Leave as is (README assumption)     |
| Edited line format        | "Edited" only / "Edited by X at T"         | "Edited by X at T" (project rule 8) |

## States and transitions

| State           | What the reviewer sees                                                                    | Transitions                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Reading         | Claims as text, Edit, Approve, Send back enabled                                          | Edit → Editing; Approve → Confirming; Send back → Reason                                                                                        |
| Editing         | Textareas, Save, Discard; Approve and Send back disabled; live region "Edits are unsaved" | Save (valid, changed) → Reading, edited; Save (unchanged) → Reading; Save (empty) → Editing with error; Discard or Escape (unchanged) → Reading |
| Reading, edited | As Reading plus Edited mark and by/at line; live region "Changes not approved yet"        | Edit → Editing (draft starts from current text); Revert → Reading; Approve → Confirming (names edited count)                                    |
| Confirming      | Approve dialog, focus on title, Escape returns focus to Approve                           | Confirm → Approved; Cancel → previous state                                                                                                     |
| Approved        | Read-only, approved by/at shown, Edit hidden                                              | none (read-only)                                                                                                                                |
| Revision needed | Read-only, reason and by/at shown                                                         | none (read-only)                                                                                                                                |

Loading and error are query states, not rows here; the form never opens while the document is
loading or failed.

## Sources

- GitLab Design System, Modal component guidance: when to use a modal and when inline is better;
  focus and destructive confirmations. Updated 15 Sept 2026.
  https://design.gitlab.com/components/modal
- PatternFly v5, Inline edit design guidelines (release 5.4.2): field, row and full-page edit;
  save and cancel behaviour. https://v5-archive.patternfly.org/components/inline-edit/design-guidelines
- AI UX Playground, Approval workflows pattern: states, edit as first-class, consent to edited
  payload, anti-patterns. Updated 10 July 2026. https://www.aiuxplayground.com/pattern/approval-workflows
- Zartis, "Human-in-the-Loop UI Patterns: Designing Intentional Friction for Safer AI Products".
  11 June 2026. https://www.zartis.com/human-in-the-loop-ui-patterns-designing-intentional-friction-for-safer-ai-products/
- Editage, "How to verify an AI-edited manuscript": re-check citations against revised wording,
  compare before and after. 12 Aug 2026. https://www.editage.com/blog/how-to-verify-an-ai-edited-manuscript-checks-for-hallucinations-flow-and-scientific-writing-quality/
- Vibe Graveyard, "ChatGPT rewrote verified citations in Connecticut Supreme Court briefs": a
  check covers only the version checked. 28 Aug 2026.
  https://vibegraveyard.ai/story/glg-law-chatgpt-verified-citations-rewritten/
- Microsoft HAX Toolkit, Guideline 9 "Support efficient correction", patterns 9B and 9C.
  Updated 17 Oct 2023. https://www.microsoft.com/en-us/haxtoolkit/library/pattern/11/
- Jazz, History patterns: per-edit `by` and `madeAt`, "last updated by" derivation. Example dated
  22 May 2025. https://jazz.tools/docs/react-native/design-patterns/history-patterns
- Basis Design System, Disabled buttons: enabled by default with inline errors; disabled Save for
  an unchanged form is the exception. 2026. https://design.basis.com/patterns/disabled-buttons
- Atlassian Jira issue JRACLOUD-61439, "Prompt user before clearing changed values when ESC key is
  pressed during inline edit". Reported 14 June 2016, closed 20 Sept 2022.
  https://jira.atlassian.com/browse/JRACLOUD-61439
- W3C WAI ARIA Authoring Practices, Dialog (Modal) pattern: focus return to the invoking element
  or to the element that continues the workflow. https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
- W3C, Understanding SC 2.4.11 Focus Not Obscured (Minimum): sticky footers as the typical
  failure, scroll padding as a fix. Updated 15 June 2026.
  https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured.html
- NHS digital service manual, Check answers pattern: Change links with hidden text, return to
  the summary. Updated June 2026. https://service-manual.nhs.uk/design-system/patterns/check-answers
