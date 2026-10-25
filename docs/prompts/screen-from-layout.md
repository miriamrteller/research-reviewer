# Prompt: screen from layout

## 1. Goal

Turn the static layout in `<src/screens/LayoutName.tsx>` into the live <screen name> screen, backed
by the <resource> resource from the mock API, with loading, error and success states and journey
tests.

## 2. Read first

- `<src/screens/LayoutName.tsx>`: the layout. It is the spec. Reuse its markup, roles, names and
  heading order; move it, do not redraw it.
- `src/api/health.ts` and `src/mocks/handlers/health.ts`: the shape every resource copies.
- `docs/adr/<NNN>-ADR-<Topic>.md` and `README.md` sections "Assumptions", "In scope, out of scope".
- `e2e/screen-reader.spec.ts`: the tree the layout already satisfies; it must still pass.

## 3. Assumptions

- The user is <who>, and the journey is: <step 1>, <step 2>, <step 3>.
- The screen shows <fields>, from one GET `<path>` returning <shape in words>.
- <Decision from the ADR the screen must respect, in your words.>
- Out of this step: <what the next prompt builds>.

## 4. Build

- Schema: `src/api/<resource>/schema.ts`, `z.strictObject` for <entities>, branded ids, every
  signal or enum the brief names, cross-field rules in `superRefine`. Types by `z.infer`.
- Resource module: key factory, `queryOptions`, `use<Resource>()` through `request()`.
- Fixture `src/mocks/fixtures/<resource>.ts` parsed through the schema; handler
  `src/mocks/handlers/<resource>.ts` starting with `applyScenario('GET <path>')`, registered in
  `handlers/index.ts`.
- Container `src/screens/<ScreenName>.tsx`: calls the hook, early returns for loading
  (`<output aria-busy>`) and error (`role="alert"` with Retry), success last.
- Presentational components under `src/components/<area>/`, props in, markup out, none over about
  150 lines.
- `App` renders the screen. Remove the layout file once nothing imports it.

## 5. Exact copy

- Heading: "<h1 text>".
- Loading: "<loading text>". Error: "<error text>" with button "Retry".
- <Every other visible string, including labels of icon-only buttons.>

## 6. Tests

`src/screens/<ScreenName>.test.tsx` with `renderWithProviders`, one `it` per journey step, named in
the journey's words: "<sees X>", "<opens Y>", "<sees the error and retries>", plus loading, and an
axe scan on each of the three states. `e2e/a11y.spec.ts` gains `/?mock=slow&delay=4000` and
`/?mock=down` for this screen. `e2e/screen-reader.spec.ts` and `e2e/keyboard.spec.ts` updated only
where the layout's tree changed, asserting the new names and states.

## 7. Out of scope

<The write action, inspect interactions, sub flows or extra states that later prompts build.> No new dependencies,
no global store, no colours outside the tokens.

## 8. Done when

`npm run verify` and `CI=1 npm run test:e2e` green; a screenshot at <width> by <height> shows the
success state with no page scroll.

## 9. Commit and log

Commits, one each: schema and mock; screen and components; tests. AI log line: `<Screen> (<name>'s
layout and decisions): AI generated schema, mock, screen and tests from the layout; <name> changed
<what>.`
