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
- Source highlight and open at passage (Miriam's instruction): AI linked claims and source cards
  both ways on hover and focus (outline and underline, keyed by claim id and citation number),
  made citation numbers buttons that go to their source, and opened a source to its whole passage
  on a scrolling paper with the quote marked, the reference code linking out to a made-up URL, and
  Escape returning focus to the chevron. Miriam added the passage paper and the reference link, tint on the claim words only with no outline, a bold citation number, a tinted outlined source, the chevron under the grade badge, only the cited words lit, and cards shrinking while a source is open (badges on a second line, as one line did not fit).
