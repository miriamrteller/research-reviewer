# Rules for AI coding assistants

Read this before writing code. It applies to Claude Code, Cursor and any other assistant. These are
process rules for any project built on this template. Scope and design decisions live in the
README and `docs/adr/`: build only what they describe, and do not re-decide them.

## AI generates, the human decides

In a timebox, the assistant writes the code. The human's time goes on deciding scope and design,
reviewing every change against these rules, and judging whether the result serves the user.

- Generate whole, working slices (schema, handler, component, test), not fragments to hand-finish.
- Say what you generated and what you assumed, so the review and the AI log are quick. List every
  decision the human did not make as "decided without <name>" in the PR, so it can be overruled.
- When the human asks for research or options, give two or three with one recommendation and
  screenshots, and build nothing until they choose.
- Try a redesign beside the current design. Do not delete the working version until the human has
  compared both.
- Every build step ends with a screenshot at the target viewport, so the human reviews pictures,
  not diffs.
- Respect the cut list. Speed comes from building less, not from skipping tests or checks.

## Non-negotiables

1. **Stay in scope.** Build only what the README and ADRs describe. If a task needs something new,
   stop and ask.
2. **No new dependencies without asking.** Base UI, TanStack Query, Zod, Tailwind, lucide-react,
   MSW, Vitest, Testing Library and Playwright are installed. If a package seems missing, say which
   and why, then wait.
3. **`npm run verify` is green before every commit.** Never skip, weaken or `--no-verify` past a
   check. Run `CI=1 npm run test:e2e` before opening a PR and after any change to `App`.
4. **Small commits, one change each,** with a plain message saying what changed. When a change
   follows the human's instruction, say so in the message ("Miriam's instruction").
5. **Log AI usage per commit.** One short line in `docs/ai-log.md`: the piece, what the assistant
   produced, what the human changed or rejected.
6. **Branches stay current.** Work on a branch and open a PR. When anything lands on `main`, merge
   `main` into every open branch and resolve conflicts straight away. Merge, never rebase, on a
   shared branch. CI runs on every PR and is the gate wherever the `main` ruleset is on. In a repo
   where CI is switched off (`npm run ci:off`), the local checks in rule 3 are the gate.
7. **Merge only with the human's yes for that PR.** Ask at the start whether you may merge it
   yourself once checks are green; without that yes, ask again when it is green.
8. **Every user action records who and when.** Each write stores an author and an ISO timestamp
   (`{ by, at }`), and the UI shows them.
9. **Fictional, brand-neutral data only.** Invent every name, figure and source. No real
   organisations, people or brands, in fixtures, copy or docs.

## Where things live

```
src/api/<resource>/   Zod schemas, key factory, queryOptions, hooks. The only place that knows
                      the API shape. Copy the shape of src/api/health.ts.
src/api/client.ts     request<T>(path, { parse, method, body, signal }). The only fetch.
src/mocks/fixtures/   Seed data, parsed through the schema so a bad fixture fails at import.
src/mocks/handlers/   MSW handlers. First line of every handler: applyScenario('METHOD /path').
                      Register in handlers/index.ts or the mock does not exist.
src/components/       Presentational. Props in, markup out. No fetching, no query hooks.
src/screens/          Containers: call the hooks, own local drafts, pass props down.
src/lib/              Pure helpers (cn, describeError). No React, no fetch.
e2e/                  Playwright: axe matrix, keyboard, screen-reader tree.
```

- **Components are small:** one responsibility, under about 150 lines. Split when a component
  gains a second reason to change.
- **Containers are thin:** hooks, local state and layout, no markup-heavy JSX.
- **Mock at the network layer only.** No `if (mock)` branches. A new endpoint is a handler plus a
  fixture.
- **No hand-written type aliases.** Types come from `z.infer` next to their schema.

## State

- **Server state lives in TanStack Query only.** Reads: `useQuery(queryOptions)`. Writes:
  `useMutation` with `retry: false`, then `setQueryData` or `invalidateQueries` by key factory.
  Never copy query data into `useState`.
- **UI drafts are local `useState`** in the screen that owns them. No global store, no Context for
  data. If prop drilling gets deep, split the component.
- **Loading and error are query states** (`isPending`, `isError`, `failureCount`), not fields on
  the data.
- **Derived values are computed during render,** not stored.

## Types: Zod is the source of truth

- Every API shape is a `z.strictObject`. The type is `z.infer<typeof Schema>`, exported beside it
  with the same name.
- Required strings are `z.string().min(1)`. Ids are branded so one cannot be passed for another.
- Unions are discriminated on a literal field. Add the variant to the schema first; the compiler
  then points at every switch that needs it.
- Cross-field rules (unique ids, references that must exist) are `superRefine` on the schema.
- Parse at the boundary: `request(path, { parse: Schema.parse })`, `Schema.parse` on fixtures,
  `safeParse` on request bodies in handlers. Inside the app, trust the type.
- No `any`, no `as` casts to silence the compiler, no `!` non-null assertions.

## Accessibility (WCAG 2.2 AA, enforced by lint, axe and the e2e tree)

- **Semantic first.** Native elements, headings in order, one `h1`, one `main`. ARIA only when no
  element gives the role.
- **Every control has a name.** Icon-only buttons get an `aria-label` that says what they do.
  Decorative icons are `aria-hidden="true"`.
- **Never colour alone.** Status is icon, colour and word together, always visible, never behind
  hover.
- **Each value gets its own badge.** Within one group of badges (one status, one rating), every
  value has its own icon and its own colour, so no two values in the group look alike. Different
  groups may reuse the same colours.
- **The API health toast** (`src/screens/ApiHealthToast.tsx`) is the app's only notification. There
  is no top bar and no theme switcher; theme and scheme come from the URL
  (`?theme=brand&scheme=dark`). Do not add either back without asking. Toasts use the polite
  (`low`) priority: the urgent one hides the toast from screen readers and fails axe.
- **Colour has one meaning each.** Green means approved or done, red means error or rejected,
  amber means needs attention. A neutral state (edited, selected) gets a neutral outline, not a
  coloured tint that reads as a warning.
- **Different things get different words.** Two labels on one screen never share a root
  ("Supported" and "Supporting" are one word to a skimming reader).
- **Show each fact once.** Do not repeat a badge, reason or quote in two places on one screen. A
  legend or key lists items in the order they appear on screen.
- **Fit the target window.** The screen fits the brief's target viewport (by default a laptop,
  1366 by 657 inside the browser) with no page scroll, and primary actions stay visible. Long
  content scrolls inside its own box.
- **Follow the system colour scheme.** Do not force light or dark by default.
- **Fixed things never cover focus** (WCAG 2.4.11). Anything `fixed` or `sticky` (toast, button,
  bar) gets `scroll-padding` and bottom padding to match, and a keyboard test that tabs the page
  and checks no focused control is hidden under it.
- **No text below 11px.** Sizes come from the type scale only (`type-*` utilities), never
  `text-[…]`. `src/styles/type-size.test.ts` enforces it.
- **Focus is managed, never dropped.** After Retry, Save, closing a dialog or any change that
  removes the focused control, focus lands on something meaningful, never `<body>`. Visible focus
  ring on every stop.
- **Keyboard parity.** Everything a mouse can do, the keyboard can do. Every hover effect also
  happens on focus.
- **Use Base UI primitives** for dialog, menu, accordion, toggle, field, toast. Do not hand-roll
  them.
- **Tokens only.** Colours come from M3 token utilities (`bg-*`, `text-*`), never raw hex or
  Tailwind palette classes. A new colour pair needs a contrast test in `src/styles/tokens.test.ts`.
- **Forms.** Each field has a visible label; errors are linked with `aria-describedby`.

## Testing: test the user flow

- **One `it` per journey step from the README,** named in the user's words.
- **Query by role and accessible name:** `getByRole`, then `getByLabelText`, then `getByText`.
  Never `getByTestId`, class names or DOM structure. If a test cannot find an element by role, the
  markup is wrong.
- **Drive with `userEvent`,** not `fireEvent`.
- **No implementation details.** No asserting on state values, hook returns or props. No mocking
  modules you own. The only mock is MSW: `setScenario('down')`, `setScenario('slow')`,
  `requestLog` for request counts.
- **Render with `renderWithProviders`** from `src/test/render.tsx` (instant retries).
- **Every screen test covers loading, error and success,** with one `axe` scan per state.
- **Schema tests are short:** a fixture parses; an invalid shape fails with the expected path.
- **Name the element in e2e locators** (`getByRole('dialog', { name })`): the toast is a dialog
  too, so an unnamed locator matches two and fails in strict mode.
- **Browser layer.** Add each new screen state to `e2e/a11y.spec.ts`. When the page changes,
  update `expectedTree` in `e2e/screen-reader.spec.ts` and the tab order in `e2e/keyboard.spec.ts`
  in the same commit. Never delete a spec or loosen it to `toBeVisible`.
- **Run Playwright with `CI=1`** so it builds fresh instead of reusing a stale preview server,
  which has hidden real failures.
- **A failing test is information.** Fix the code or the expectation; never skip, `.only`, or widen
  a timeout to hide a race.

## Code style

- TypeScript strict, functional components, named exports, no default exports except `App`.
- Props typed inline or as `type XProps`; no `React.FC`.
- Early return for loading and error; the success branch is last.
- Prettier and oxlint decide formatting and lint; no disable comments.
- Comments explain why, not what. A short header comment per module saying what it owns.
- Plain English in UI copy: say what happened and what to do next.

## Definition of done

- [ ] Scope matches the README and ADRs; nothing extra, nothing cut silently
- [ ] Schema, then handler and fixture, then container, then presentational components
- [ ] Journey tests by role, including loading, error and an axe scan
- [ ] e2e: new states scanned; screen-reader and keyboard specs updated if the page changed
- [ ] `npm run verify` green; `CI=1 npm run test:e2e` green if `App` or e2e changed
- [ ] Small commit, clear message, one line in `docs/ai-log.md`
