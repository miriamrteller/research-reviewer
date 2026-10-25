# ADR 000: Accessible by construction: Base UI, M3 tokens and a test pyramid

Status: Accepted · Date: 2026-10-23

An example in the layout every ADR here follows. It records the template's own foundation, so it
holds for any brief built on it. Copy `TEMPLATE.md` for a new one; this file is read, not edited.

## Context

Any screen built on this template must meet WCAG 2.2 AA, and it is built fast, mostly by AI. Fast
generated UI tends to drift: hand-rolled dialogs that trap no focus, colours picked by eye, status
shown by colour alone. Nobody has time for a manual audit inside a timebox.

Constraints: one React app, a mock API, no designer on hand, a brand that may change.

## Decision

Make the accessible path the only easy path, and let tests catch the rest.

- Primitives: interactive widgets (dialog, menu, toggle, field, toast) come from Base UI, which
  ships the WAI-ARIA keyboard and focus behaviour. Nothing is hand-rolled.
- Tokens: colours, type, shape and motion are Material 3 tokens mapped to Tailwind utilities. Raw
  hex and Tailwind's palette are removed, so a colour that is not a token cannot be used.
- Brand: a brand file may only set colour roles and typefaces. Layout, type scale and motion stay
  the same for every brand.
- Contrast: every token pair the UI uses is tested at 4.5:1 for text and 3:1 for non-text, in
  light and dark, for every brand. A new pair needs a new test.
- Tests, cheapest first: lint (`jsx-a11y`), token contrast, unit tests by role with axe in jsdom,
  axe in a real browser across themes, schemes and window sizes, then keyboard and
  screen-reader-tree specs.
- Status: icon, colour and word together. Loading is a polite `<output>`, errors are an alert with
  a named Retry, focus never drops to `<body>`.

## Alternatives considered

- MUI or another styled component library. Rejected because its look fights a custom brand and
  overriding it costs more than styling headless parts.
- Hand-rolled widgets. Rejected because focus traps, Escape handling and ARIA states are where
  generated code most often goes wrong.
- A manual audit at the end. Rejected because there is no time for it in a timebox and it does not
  stop the next change from regressing.
- axe only. Rejected because automated rules find roughly half of the issues; the keyboard and
  screen-reader specs cover focus order, names and announcements that axe cannot judge.

## Consequences

- What becomes easier or safer: a generated screen that compiles and passes the suite is keyboard
  operable, named, and above AA contrast in every theme.
- What the codebase now guarantees: no colour outside the tokens, no unnamed control, no WCAG-tagged
  axe violation in any tested state, one `main` and one `h1`.
- What becomes harder, or what the prototype does not cover: every new page state needs its scan
  and its place in the screen-reader tree; real screen-reader speech, 400% zoom and plain-language
  quality still need a person.
- What a reviewer should watch for: new colour pairs without a contrast test, `aria-*` used where
  a native element would do, and specs loosened to pass.
