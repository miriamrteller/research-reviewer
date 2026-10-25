# Prompt: sub flow

A sub flow is a short journey the user opens from the main screen and leaves again: an edit mode, a
feedback dialog, a key or legend. It is optional, so it is the first thing cut. The main flow
(layout, write action, inspect) must work exactly as before with it in place.

## 1. Goal

Add the <sub flow name>: the user <opens it from where>, <does what>, and <ends where>.

## 2. Read first

- `src/screens/<ScreenName>.tsx`: the main screen this flow is opened from.
- `docs/adr/<NNN>-ADR-<Topic>.md`, section "Decision", and `README.md` "Assumptions".
- `src/components/ui/`: the Base UI primitive to use (dialog, popover, toggle). Do not hand-roll.
- <If it writes: `src/mocks/handlers/<resource>.ts` and `docs/prompts/write-action.md`.>

## 3. Assumptions

- Trigger: <button name and place>, <always visible / hidden while X>.
- States: <closed, open, in progress, done, error>. Leaving without finishing <discards / warns>.
- Effect on the main flow: <none / disables Approve while open>. If any, the main flow's own
  buttons say why they are disabled.
- Writes: <nothing / one POST recording who and when (`UserAction { by, at }`)>.
- It must not cover a focused control, and it fits the target viewport with no page scroll.

## 4. Build

- New components under `src/components/<Area>/`, props only; local state in the screen that owns it.
- Focus: opens onto <first control>; Escape and Close return focus to the trigger; after a save
  focus lands on <status element>, never on `<body>`.
- <If it writes: handler with `applyScenario` first, `safeParse`, mutation with `retry: false`.>

## 5. Exact copy

Trigger: "<label>". Title: "<title>". Buttons: "<word>", "Cancel". Status: "<text>".
Error: "<text>". <Every other visible string.>

## 6. Tests

By role: "<opens it and finishes>", "<leaves without finishing and nothing changes>", "<sees the
error and retries>" if it writes, "<the main flow still works with it open or done>", plus an axe
scan with it open. `e2e/keyboard.spec.ts` gains the open and close path; screen-reader tree gains
the trigger name.

## 7. Out of scope

Schema changes beyond <the one field>; changes to the main flow's markup beyond the trigger; any
other sub flow; undo; versions.

## 8. Done when

`npm run verify` and `CI=1 npm run test:e2e` green; screenshots at <width> by <height> with the
trigger at rest, the flow open, and the result.

## 9. Commit and log

Commits: component; wiring; tests. AI log line: `<Sub flow> (<name>'s decision): AI added <what>;
<name> changed <what>.`
