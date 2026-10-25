# AI usage log

One line per commit: the piece, what the assistant produced, what the human changed or rejected.

- Health toast and no top bar (Miriam's instruction): AI ported the API health toast from the
  review workspace, removed the top bar and theme switcher, and updated the unit and e2e tests.
- Generic kit (Miriam's instruction): AI added `CLAUDE.md` with process rules only, the prompt
  skeleton, the timebox routine, and an example ADR on the accessibility decisions; it replaced the
  90-minute roadmap with the timebox routine.
- README (Miriam's instruction): AI cut the README to a skeleton with placeholders and moved the
  technical reference to `docs/template-guide.md`.
- Rules collated (Miriam's instruction): AI gathered the rules added during the review workspace
  build, stated and inferred, and added the generic ones to `CLAUDE.md` with the 11px text-size test.
- Research questionnaire (Miriam's instruction): AI collated the sources decisions from the
  review workspace into a question list and wrote it as a generic `docs/research/` questionnaire,
  one file per theme, linked from the timebox routine. Miriam rejected it as decision questions
  rather than generic ones, and cut it to ten questions answerable from any brief in five minutes;
  AI rewrote `docs/research/README.md` to that list and removed the eleven theme files.
- Prompt templates and ADR skeleton (Miriam's instruction, 2026-10-23): AI replaced the prompt
  skeleton with four templates in `docs/prompts/` (ADR, screen from layout, detail layer, write
  action), moved the blank ADR to `docs/adr/TEMPLATE.md` so `000` is the only numbered ADR, and
  updated the timebox page and guides; Miriam asked that the ADR prompts use the example without
  confusion, which set the "read for tone, never edit" rule.
- Timebox readiness fixes (Miriam's instruction, 2026-10-25): AI rewrote the schedule and cut rules in
  `docs/timebox.md` to the five-PR plan, made local checks the merge gate so CI never blocks the
  timebox, and pointed the README skeleton at `docs/research/`; Miriam found the contradictions.
- Inspect and sub-flow templates (Miriam's instruction, 2026-10-25): AI renamed the detail-layer prompt to inspect (read-only, main flow), added a sub-flow prompt for optional journeys, and made the timebox cut sub flows first; Miriam set the main-flow, inspect and sub-flow split and that the badges are never cut.
- CI on/off switch (Miriam's instruction, 2026-10-25): AI first switched CI off in the template;
  Miriam said she usually wants CI, only not in the timeboxed repo, so that was reverted. AI then
  added `npm run ci:off` / `ci:on` (`scripts/ci-switch.mjs`), which park the workflow in `ci/` and
  move it back, and noted it in CLAUDE.md, timebox, quick start, setup and template guide.
- ADR 001 source badges (Miriam's instruction, 2026-10-25): AI drafted the ADR from the research
  note `docs/research/uncertainty-signals.md` (five badge groups and their values); it folded
  `corrected` into text so every publication-status value has its own colour. Miriam to review.
- Architecture diagrams (Miriam's instruction, 2026-10-25): AI drew two new diagrams, which Miriam
  rejected and had deleted; at her instruction it copied three of her earlier approved diagrams
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
