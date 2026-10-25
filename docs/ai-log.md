# AI usage log

One line per commit: the piece, what the assistant produced, what the human changed or rejected.

- ADR 001 source badges (Miriam's instruction, 2026-10-25): AI drafted the ADR from the research
  note `docs/research/uncertainty-signals.md` (five badge groups and their values); it folded
  `corrected` into text so every publication-status value has its own colour. Miriam to review.
- Architecture diagrams (Miriam's instruction, 2026-10-25): AI added Miriam's approved diagrams
  (high level, approve and revise, sources) unchanged into `docs/architecture.md`.
- Static review layout from sketch (Miriam's instruction and sketch, 2026-10-25): AI read
  `docs/research/my-layout-sketch.jpg`, asked about the handwriting it could not read, and built the
  static layout (question, status, badge key, claims paper with citation numbers and caveat, source
  accordion with grade, badges, "Lowered because" line and quote, Revise/Approve, Feedback FAB) with
  fictional sample content and updated the unit and e2e specs; Miriam answered the open questions
  (two sources per claim allowed, "Lowered because" lines, renamed from "Why this was lowered", caveat kept, badges neutral until the
  badge step).
- Badge key and Feedback (Miriam's instruction): the assistant built the Badge key popover (one
  table: signal, every value with its icon and word, the question it answers, from ADR 001 and the
  research badge key) and the Feedback dialog (ease 1 to 5, topic, comment) posting to a mock
  `POST /api/feedback` that stamps who and when, with journey tests; Miriam reviews.
- Badge key one line per row (Miriam's instruction): the assistant made the key a striped table with
  every row on one line, no divider lines.
- Badge colours (Miriam's instruction, 2026-10-25): AI derived green, amber and orange M3 custom
  colour roles from HCT tones (light and dark), mapped them to Tailwind utilities, coloured each
  badge value per ADR 001 (red from the error roles, neutral as outline), and added contrast tests
  for every badge pair; Miriam set one colour per value and orange for Limited.
- Badges as a prototype stand-in (Miriam's instruction, 2026-10-25): AI added a README assumption
  that the badge set is for the prototype and a real product would use its own badges.
- Badge good values blue (Miriam's instruction, 2026-10-25): AI re-derived the positive role at
  HCT hue 255 so green keeps one meaning (Approved), and updated ADR 001.
- Limited badge pink (Miriam's instruction, 2026-10-25): AI moved the limited role to HCT hue 355
  so it no longer looks like amber Moderate, and updated ADR 001.
- Badge text in its own colour (Miriam's instruction, 2026-10-25): AI set each badge's word and
  icon to the strong tone of its colour, with contrast tests for each pair.
- Live review screen with Approve and Revise (Miriam's instruction and seed text, 2026-10-25): AI
  wrote the review schema (ADR 001 badge enums, `{ by, at }` review states), a fixture from her
  draft summary, sources, uncertainty wording and question, the mock API, Base UI Approve and
  Revise dialogs (one write each, never retried) and the three read-only header states, and
  updated the unit and e2e specs. AI chose the claim-to-source mapping, badge values and the
  approved tint; at her instruction it added `?doc=badges` so the two fixtures show all 17 badge values. Miriam to review.
- Approved green (Miriam's instruction, 2026-10-25): AI added an `approved` green custom colour
  (HCT hue 145, chroma 40, standard M3 tones) with contrast tests and used it for the Approved
  header tint, replacing the interim purple.
- Revise button wording (Miriam's instruction, 2026-10-25): AI renamed the Revise dialog's confirm
  button from "Send back" to "Send for revision" and updated the tests.
- Claim editing research (Miriam's instruction, 2026-10-25): AI searched the web and wrote
  `docs/research/claim-editing.md`. Miriam rejected two drafts (README assumptions; then too
  much on the obvious inline case) and redirected it to versions, multiple users, authorisation
  and audit, and one paragraph versus separate boxes that look like one paragraph. Docs only.
- Source highlight and open at passage (Miriam's instruction): AI linked claims and source cards
  both ways on hover and focus (outline and underline, keyed by claim id and citation number),
  made citation numbers buttons that go to their source, and opened a source to its whole passage
  on a scrolling paper with the quote marked, the reference code linking out to a made-up URL, and
  Escape returning focus to the chevron. Miriam added the passage paper and the reference link, tint on the claim words only with no outline, a bold citation number, a tinted outlined source, the chevron under the grade badge, only the cited words lit, and cards shrinking while a source is open (badges on a second line, as one line did not fit).
- Cited words in the schema (Miriam's instruction): AI merged main (fixture, badge key) into the
  source highlight branch, replaced each claim's `sourceIds` with `citations: [{ sourceId, words }]`
  in the Zod schema and both fixtures, with a check that the words are in the claim text.
- Long passages (Miriam's instruction): AI wrote longer fictional passages for the three sources
  and made the open source's paper run to the card's edges and fill the free height of the
  Sources column, scrolling inside, with the other sources still visible.
- Smallest edit flow (Miriam's instruction, 2026-10-25): AI added `edit?: { by, at }` to a claim and
  optional `claims` edits to the Approve and Revise bodies, an edit draft hook on the review screen,
  a borderless textarea per claim that reads as one paragraph, Edit/Save/Discard, an "Edited by"
  line, and the note that edits stay on the page until approved or sent for revision, with journey
  tests and e2e updates. AI chose the hidden "Claim n of N" labels, inline refusal of an empty claim,
  and hiding Approve and Revise while editing. Miriam to review.
- CI switched off (Miriam's decision, 2026-10-25): `npm run ci:off` parks the workflow; local
  `npm run verify` and `CI=1 npm run test:e2e` are the gate for this timeboxed repo.
- CI switched back on (Miriam's instruction, 2026-10-25): `npm run ci:on` moves the workflow back
  to `.github/workflows/`, so PRs run quality, unit, build and e2e again.
- README Uncertainty section (Miriam's instruction, 2026-10-25): assistant replaced the
  placeholder with the five ADR 001 badge groups as a table and a short note on how the prototype
  shows uncertainty, linking the ADR and research doc. Miriam to review the wording.
- Post-clock page touch-ups (Miriam's instruction, 2026-10-25): AI added a max width so the page
  centres on wide screens, scrolled the sources inside their own box so the page keeps its bottom
  margin, and made claims keep their large size unless they would scroll, then step down one type
  size at a time until they fit. Miriam to review.
- Project name (Miriam's instruction, 2026-10-25): AI replaced the leftover template name
  "Assignment18" with "research-reviewer" in `package.json` and the lockfile, and the browser tab
  title with "Research Reviewer".
