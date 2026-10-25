# Prompt templates

One build prompt per PR, written on the day from the approved `main`. Five templates cover the
shapes a two-hour prototype needs; copy the one that fits, fill every placeholder in angle brackets,
and delete nothing. An empty heading is a decision the AI will make for you. Rules that hold for
every prompt live in `CLAUDE.md`, so no prompt repeats them.

| Template                                       | Use it for                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| [adr.md](adr.md)                               | One decision record from a dictated decision and the research doc     |
| [screen-from-layout.md](screen-from-layout.md) | A static layout plus a data resource becomes a live screen with tests |
| [write-action.md](write-action.md)             | Main flow: the confirmed decision, recording who and when             |
| [inspect.md](inspect.md)                       | Main flow, read-only: badges, highlight and opening a source          |
| [sub-flow.md](sub-flow.md)                     | Optional journey opened from the main screen (edit, feedback, key)    |

## The nine sections

Every template has the same nine headings, in this order.

1. **Goal.** One sentence.
2. **Read first.** The exact files and docs, and what each is for (spec, example, do not touch).
3. **Assumptions.** The decisions already made, pasted from the README and the ADRs in your own
   words, so the AI does not re-decide them.
4. **Build.** Files, component names, props, schema changes.
5. **Exact copy.** Every visible string.
6. **Tests.** Journey test names, axe scans, e2e changes.
7. **Out of scope.** What this step must not touch.
8. **Done when.** `npm run verify` green, `CI=1 npm run test:e2e` green if the page changed, and a
   screenshot at a named size.
9. **Commit and log.** The commit message and the `docs/ai-log.md` line.

## What makes a prompt land first time

- The layout is the spec: the prompt says to reuse its markup, so names and roles do not drift.
- Every visible string is in the prompt, so no copy is invented.
- Journey test names are given, so the tests describe the journey and not the functions.
- Parallel prompts list the files they may not touch.
- One screenshot at a named size is the acceptance test. Review screenshots, not diffs.
- Fill the template in the ten minutes before its slot, while the previous thread works, and
  read it once before it runs.
