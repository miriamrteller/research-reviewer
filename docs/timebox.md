# Two-hour timebox

A routine for a two-hour prototype whose brief is not known in advance, with AI building and the
human deciding. The one rule: anything that depends on the brief happens on the clock. What exists
beforehand is this template, its rules (`CLAUDE.md`), the prompt templates and this page. The README
says which is which.

## Before the brief: check the kit

- [ ] `npm ci && npm run verify`, then `CI=1 npm run test:e2e`, all green on `main`.
- [ ] `CLAUDE.md` holds process rules only: no screen names, no layout, no ADR numbers.
- [ ] The five prompt templates in `docs/prompts/`, `docs/adr/TEMPLATE.md`, `docs/research/` and the
      blank block in `docs/architecture-example.md` are in place.
- [ ] `docs/adr/000-ADR-Accessibility.md` is the only numbered ADR: the design system (Base UI,
      Material 3 tokens, brand layer) and the accessibility tests. A brief's ADRs start at `001`.
- [ ] `/?mock=slow&delay=5000` and `/?mock=down` show the health toast's loading and Retry states.

Not in the kit: research, ADRs, diagrams, screenshots, prompts or code from a previous brief.

## Minute zero: answer these from the brief

Write the answers at the top of `README.md`. They become the assumptions section of every prompt.

1. **The user and their goal.** One user, one goal.
2. **The core journey,** three to five steps ("sees X, opens Y, confirms Z"). One test per step.
3. **What the screen shows.** Five to ten fields: the Zod schema and the fixture.
4. **The states.** Loading, error, empty and success, plus the ones the brief implies.
5. **Two research questions** a reviewer would ask about the design, each answerable in 25 minutes.
   Answer the [ten questions from the brief](research/README.md) first; question 10 produces them.
6. **The ADR topic.** One decision with alternatives actually rejected; a second only if needed.
7. **In and out.** The "with more time" list starts here.
8. **The cut order,** from the rules below.
9. **Assumptions.** Every ambiguity read the most literal way, written down.

If the brief names a domain, invent all names and figures. Nothing real, nothing branded.

## CI never blocks the timebox

The timeboxed repo gets no `main` ruleset and no required checks, so nothing waits on CI and a slow
or red run cannot stop a merge. Right after creating the repo, run `npm run ci:off` and commit, so
CI does not run at all (`npm run ci:on` brings it back later). The gate is `npm run verify` and
`CI=1 npm run test:e2e` run locally before each merge. Skip the ruleset step in
[template-setup](template-setup.md).

## The schedule

Five PRs, in this order. The names are generic; the brief decides what each one holds.

| Clock        | Human                                                                                                                 | AI threads                                                                                | Hard stop                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 0:00 to 0:08 | Reads the brief twice, answers minute zero in the README, creates the repo from the template                          | None                                                                                      | 0:08: repo exists with the README                                         |
| 0:08 to 0:28 | Asks the research questions, decides in one sentence each; from 0:18 draws the layout sketch and writes its ten lines | Research: findings with sources, two options each                                         | 0:28: decisions written, else take the first option and say so in the ADR |
| 0:28 to 0:45 | Dictates the ADR, reads the drafts, checks the layout screenshot once                                                 | ADR `001`; diagram `docs/architecture.md`; static layout. PR 1: docs and layout           | 0:45: PR 1 merged                                                         |
| 0:45 to 1:10 | Reviews the screenshot at about 1:00, one correction round; decides the second hard choice by 1:00                    | PR 2: schema, fixture, handler, live screen, states, the confirmed write, tests, e2e tree | 1:10: PR 2 merged                                                         |
| 1:10 to 1:30 | Reviews the screenshot; dictates ADR `002` at 1:10                                                                    | PR 3: inspect (badges, interaction, open item)                                            | 1:30: PR 3 merged; missed by 1:35, PR 4 is cut                            |
| 1:30 to 1:50 | Reviews three screenshots                                                                                             | PR 4: a sub flow, beside PR 5: the small sub flows. Both merge `main` in first            | 1:50: all merged                                                          |
| 1:50 to 2:00 | Runs the demo URLs, writes "How AI was used" from `docs/ai-log.md`, pushes                                            | One thread: tests, fixes, final local `verify` and e2e on `main`                          | 2:00: local checks green on `main`, README matches the repo               |

Her decisions are the critical path. PR 2 and PR 3 are where the prompts must land first time.

## Cut rules, in order

1. Sub flows first: the small ones in PR 5 (a key, a feedback button), then PR 4.
2. The second ADR. It becomes a paragraph in the first one's consequences.
3. PR 3 drops its open-and-interact half if PR 2 is not merged by 1:20. The signals shown on screen
   (the badges) are never cut.
4. Extra states (empty, per-item errors). Loading and error stay.
5. Hover extras and animation. Focus behaviour stays.

Never cut: the README's assumptions and cut list, one ADR, the diagram, journey tests for what was
built, `npm run verify` before each merge, the AI log.

## Working with the AI threads

- One thread per deliverable: research, ADRs, diagram, and one per PR.
- Ask at 0:00 whether threads may merge their own PR once `npm run verify` and the e2e run pass
  locally. Without that yes, ask again for each PR when its checks pass.
- Every prompt starts from one of the templates in `docs/prompts/`. Section 3 comes from the README
  and the ADRs, never from memory of a previous brief.
- The ADR prompt copies `docs/adr/TEMPLATE.md`, reads ADR `000` for tone only and never edits or
  restates it; alternatives and their reasons come from the research doc as decided.
- One correction round per PR, as one numbered list. A second round means a cut.
- Review screenshots, not diffs, on the clock.
