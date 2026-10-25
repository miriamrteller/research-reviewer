# Editing AI claims in a review screen: versions, users, authorisation, and one paragraph or boxes

Research note for `research-reviewer`, written 2026-10-25. Scope: a reviewer changes the wording
of AI-generated claims, each tied to source cards and citation numbers, before approval. Inline
editing is taken as given. This note covers what current practice says about versions, more than
one user, authorisation and audit, and whether to edit the claims as one paragraph or as separate
boxes that look like one paragraph. It ends with the smallest build, open decisions, what to leave
out, and a state table. Dated links are in the sources section.

## 1. Versions

**Practice: versions are immutable and append-only.** Every save is a new revision with author,
time and a short summary; nothing is updated in place, and restoring an old version creates a new
revision rather than rewriting history (content versioning design, Apr 2026). Google Docs works
the same way: version history shows who changed what and when, versions can be named, and a
version can be restored or copied (Google Docs help). Drupal keeps every revision and marks one as
the "default" that visitors see, so an unpublished edit can sit ahead of the published one
(Drupalize.me, updated Oct 2024).

**Storage.** Store full snapshots for small documents; diff storage with periodic snapshots is an
optimisation for large ones (Apr 2026). A few claims per document means snapshot every time.

**What a version binds to.** Approval must name the version it approved. GitHub dismisses an
approval when a new commit lands on an approved pull request, so the approval always matches the
reviewed content (GitHub docs, required reviews). Translated: `approval.versionId`, and any later
edit puts the document back into review.

**Minimum shape.** `Document { id, currentVersionId }`, `Version { id, documentId, number,
claims[], createdBy, createdAt, summary? }`. The AI output is version 1. Diffing two versions for
"what changed" is a UI feature on top, not storage.

## 2. More than one user

Three levels of concurrency control exist; pick the lowest that fits.

| Level                        | How                                                                                                                                                                                                                                                               | When it is enough                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Optimistic locking           | Client sends the version it read (`If-Match` ETag or `expectedVersion`); server rejects with 412 if the document moved on; client reloads and re-applies (Ed-Fi API guidelines, Dec 2024; Apr 2026 design)                                                        | Edits are occasional and sequential: one person at a time, in turns |
| Soft edit lock               | "Being edited by Alice since 11:02", with unlock or request-release; lock clears on save or timeout. Confluence users asked for this in 2004 and got it in 2.1 (Atlassian issue, fixed 2012); Ibexa's editorial workflow has draft locking with a release request | Several people may open the same item, but should not edit at once  |
| Real-time merge (OT or CRDT) | Characters merge as typed; OT needs a central server, CRDTs (Yjs, Automerge) work offline and peer to peer (HackerNoon, Dec 2025)                                                                                                                                 | Two people need to type in the same text at the same time           |

For review work, where one reviewer edits and another approves, optimistic locking plus "last
edited by X at T" on the page covers it. A soft lock is the next step. Real-time merge is a
different product.

## 3. Authorisation and audit

**Roles per stage, permissions per transition.** Editorial systems attach roles to workflow
stages, so a "Needs review" stage notifies every Reviewer (Storyblok, Oct 2026), and create one
permission per transition, so only a copy editor can move content from copy editing to final
review (Drupal content moderation, Oct 2024). The review screen has four transitions: edit,
approve, send back, reopen. Each is a permission.

**Maker-checker.** In finance, every transaction needs one person to make it and a different
person to check it (maker-checker, also "four eyes"; Wikipedia). Compliance tooling routes cases
from an investigator to a separate approver queue (Sumsub 4-eyes review, Oct 2026). Feature-flag
governance uses change requests the author cannot approve, with a log of who requested, who
approved, previous state and justification (Flagsmith). GitHub enforces the same rule: authors
cannot approve their own pull request.

The question for this product: **may the person who edited a claim approve it?** Three settings:

1. Single reviewer: edit and approve are the same person. Fast, no separation.
2. Four eyes: an edited claim must be approved by someone other than its last editor.
3. Two approvals: any document needs two approvers regardless of edits.

**Audit trail.** Regulated records (21 CFR Part 11, EU Annex 11) require computer-generated,
time-stamped entries that record who, what and when, do not obscure the previous value, and are
retained and reviewable; Annex 11 also asks for the reason for a change (IntuitionLabs, Feb 2026,
updated Oct 2026). Applied to AI-drafted content, the same source links the prompt and model
version, the AI output, the reviewer's identity, time and decision, and every edit with before and
after values and a reason. That list is the audit record for this screen even where no regulation
applies:

`Event { id, documentId, versionId, type: edited | approved | sent_back | reopened, by, at,
before?, after?, reason? }`

Immutable events plus immutable versions mean "who edited and when" is a query, not a stored
field.

## 4. One paragraph or separate boxes

The claims must read as one paragraph. Three ways to edit them:

| Option                                             | How                                                                                                                                                     | Keeps claim ids and citations                                                                                                                                                                | Accessibility                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. One textarea for the paragraph                  | Whole text in one field; on save, re-split into claims and re-attach citations                                                                          | No. Re-alignment of edited sentences to the original claims is a research problem (edit alignment surveys treat it as its own task); citations become text `[2]` the user can delete or move | Simplest: one native field, one label                                                                                                                                     |
| B. One textarea per claim, styled as one paragraph | Borderless, auto-growing fields laid out inline so the boundaries vanish at rest; CSS `field-sizing: content` grows a textarea with its text (Apr 2024) | Yes. Each field is one claim; citations stay on the claim                                                                                                                                    | Each field needs a name that stands alone ("Claim 2 of 3") because a screen reader in forms mode announces fields one at a time, outside the sentence (Roselli, Aug 2021) |
| C. One contenteditable with claim spans            | Rich editor (Lexical, ProseMirror) where each claim is a node and citations are atomic marks                                                            | Yes, by construction                                                                                                                                                                         | Needs `role="textbox"`, `aria-multiline`, a label, and manual screen-reader testing (Lexical accessibility guide); more work than native fields                           |

Roselli's 2021 review of "sentence forms" is the closest practice to option B: inputs inside
prose confused magnifier and screen-reader users unless every field had its own label, errors
listed the field by name, and the layout reflowed without horizontal scroll. Those are the
conditions under which B works.

**Recommendation: B.** It is the only option that keeps claim ids and citations without an
editor library or a re-alignment step, and native textareas keep keyboard and screen-reader
behaviour for free. Make the boundaries visible on focus (a focus ring per claim), keep a visible
or visually hidden "Claim n of N" label, and list errors by claim name. Option C is the upgrade if
rich text or in-sentence citation editing is ever needed.

## Smallest build worth 20 minutes

1. Edit opens one form: a borderless textarea per claim, inline, "Claim n of N", focus in the
   first. Save and Discard. Save with no change closes without a mark.
2. Save creates a new version `{ number, claims, createdBy, createdAt }` and appends an `edited`
   event with before and after. The page shows "Edited by X at T" on changed claims, from the
   events.
3. Approve stores `versionId`. A save after approval returns the document to review and the
   confirmation says so.
4. Save sends `expectedVersion`; on a 412 the screen says "Someone saved a newer version" and
   offers Reload.

## Open decisions (default first)

| Decision                              | Default                                    | Alternative                                    |
| ------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| Can the editor approve their own edit | Yes, single reviewer                       | Four eyes: last editor cannot approve          |
| Concurrency                           | Optimistic locking, reload on conflict     | Soft edit lock with "being edited by"          |
| Version storage                       | Full snapshot per save                     | Diffs with periodic snapshots                  |
| Approval binding                      | To a version id; later edit reopens review | Approval survives edits, marked stale          |
| Reason for edit                       | Optional note                              | Required (Annex 11 style)                      |
| Claim label                           | Visible "Claim n of N"                     | Visually hidden label, visible focus ring only |
| Restore an old version                | Creates a new version                      | Not offered                                    |

## What to leave out, and why

| Leave out                           | Why                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Real-time co-editing (OT, CRDT)     | Review is turn-based; optimistic locking handles it with one status code |
| Diff storage                        | Snapshots are tiny at this size                                          |
| Multi-step undo and redo            | Versions give revert; an in-session undo stack is state nobody can see   |
| Edit history UI (timeline, compare) | Record the events now; render them later                                 |
| Two-approval policy                 | A role flag on the approve transition can add it later                   |
| Option C rich editor                | Only needed for rich text or editing citations inside sentences          |
| Reason for every edit               | Keep the field optional until a compliance need names it                 |

## States and transitions

| State                 | Who can act                                               | Transitions                                                                               |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| In review (version n) | Anyone with `edit` or `approve`                           | Edit → Editing; Approve → Confirming; Send back → Reason                                  |
| Editing               | The editor                                                | Save (changed) → Saving; Save (unchanged) or Discard → In review                          |
| Saving                | system                                                    | 2xx → In review (version n+1, `edited` event); 412 → Conflict; error → Editing with alert |
| Conflict              | The editor                                                | Reload → In review (latest), draft kept in the form                                       |
| Confirming            | Anyone with `approve` (not the last editor, if four eyes) | Confirm → Approved (`approved` event, `versionId`); Cancel → In review                    |
| Approved              | Anyone with `reopen`                                      | Edit or Reopen → In review (`reopened` event)                                             |
| Revision needed       | Anyone with `reopen`                                      | Reopen → In review                                                                        |

Loading and error are query states and have no rows.

## Sources

- techinterview.org, "Content Versioning Service Low-Level Design": append-only revisions,
  restore creates a revision, optimistic locking. Updated 17 Apr 2026.
  https://www.techinterview.org/post/3233470545/lld-content-versioning/
- Google Docs Help, "Find what's changed in a file": version history, named versions, restore,
  Show editors. https://support.google.com/docs/answer/190843
- Drupalize.me, "Overview: Workflows and Content Moderation": states, per-transition
  permissions, default revision. Updated 18 Oct 2024.
  https://drupalize.me/tutorial/overview-workflows-and-content-moderation
- GitHub Docs, "Approving a pull request with required reviews": authors cannot approve their
  own PR, stale approvals dismissed on new commits.
  https://docs.github.com/en/enterprise-server@3.21/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews
- Ed-Fi API guidelines, "Handling optimistic concurrency with ETags": If-Match, 412, reload on
  conflict. Updated 8 Dec 2024.
  https://docs.ed-fi.org/reference/data-exchange/api-guidelines/design-and-implementation-guidelines/api-implementation-guidelines/handling-optimistic-concurrency-with-etags
- Atlassian CONFSERVER-1193, "Warn when page is concurrently edited by multiple users". Created
  4 May 2004, fixed 20 Dec 2012. https://jira.atlassian.com/browse/CONFSERVER-1193
- Ibexa DXP 6.0 user guide, Editorial workflow: review queue, draft locking, release requests.
  https://doc.ibexa.co/projects/userguide/en/6.0/content_management/workflow_management/editorial_workflow/
- Saumya Tyagi, "CRDTs vs Operational Transformation: A Practical Guide to Real-Time
  Collaboration", HackerNoon, 24 Dec 2025.
  https://hackernoon.com/crdts-vs-operational-transformation-a-practical-guide-to-real-time-collaboration
- Storyblok, Roles: roles per workflow stage, custom permissions. Updated 13 Oct 2026.
  https://www.storyblok.com/docs/manuals/roles
- Wikipedia, "Maker-checker". https://en.wikipedia.org/wiki/Maker-checker
- Sumsub, "4-eyes review": investigator and approver as separate officers. Updated 19 Oct 2026.
  https://docs.sumsub.com/docs/4-eyes-review
- Tanaaz Khan, "What is the Four Eyes Principle?", Flagsmith: change requests, author cannot
  approve, audit log fields. https://flagsmith.com/blog/what-is-the-four-eyes-principle
- IntuitionLabs, "GxP Audit Trails for AI: 21 CFR Part 11 & Annex 11 Rules". 4 Feb 2026, updated
  3 Oct 2026. https://intuitionlabs.ai/articles/audit-trail-requirements-ai-gxp-compliance
- Adrian Roselli, "Sentence Forms (not Mad Libs)": inputs inside prose and their accessibility
  cost. 16 Aug 2021. https://adrianroselli.com/2021/08/sentence-forms-not-mad-libs.html
- Aaron Gustafson on Stephanie Stimac's CSS `field-sizing` article: auto-growing textareas.
  1 Apr 2024. https://aaron-gustafson.com/notebook/links/better-form-ux-with-the-css-property-field-sizing-/
- Lexical, Accessibility guide: ARIA for a contenteditable editor, manual screen-reader testing.
  https://mintlify.wiki/facebook/lexical/guides/accessibility
- "Making Revisions Understandable: A Survey of Edit Intentions, Methods, and Applications",
  arXiv 2609.01610 (Sept 2026): edit alignment between revisions as its own task.
  https://arxiv.org/abs/2609.01610
