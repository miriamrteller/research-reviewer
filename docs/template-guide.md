# Template guide

The technical reference for this template, moved out of the README so the README can be the
project's own. Production-grade React + TypeScript foundation: Material Design 3 tokens, a swappable brand
layer, headless accessible primitives, and an accessibility test pyramid that gates every change.

## Stack

| Concern       | Choice                                | Why                                                                                          |
| ------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Build         | Vite 8 · TypeScript 6 (strict)        | Fast, standard, warning-free production build                                                |
| Styling       | Tailwind CSS 4 (CSS-first `@theme`)   | Tokens and utility mapping live together in CSS; theme swaps need no rebuild                 |
| Primitives    | `@base-ui/react`                      | shadcn/ui's default since 2026-07; MUI-backed, monthly releases; WAI-ARIA behaviour built in |
| Icons         | `lucide-react`                        | Tree-shakeable, consistent stroke system                                                     |
| Unit tests    | Vitest 5 · Testing Library · jest-axe | Fast jsdom scans for structure, names, roles, keyboard behaviour                             |
| Browser tests | Playwright · `@axe-core/playwright`   | Real layout → real contrast; keyboard, focus, reflow, reduced-motion                         |
| Static a11y   | oxlint `jsx-a11y` plugin              | Catches violations as you type, before any test runs                                         |

## Getting started

```bash
npm install          # also installs git hooks via husky
npm run dev          # http://localhost:5173
```

Set the theme and scheme from the URL: `/?theme=brand&scheme=dark`. Themes: `material` (M3
baseline), `brand` (generic placeholder). There is no switcher on the page and no top bar; the
API's health shows as a toast in the bottom-left corner.

In development the app talks to a **mock API** (MSW). Drive its behaviour from the URL with
`?mock=<scenario>`: `ok` · `slow` (2 s latency, or `&delay=<ms>`) · `flaky` (fails twice, then recovers — watch the
retry counter) · `down` (503 + Retry-After) · `notfound` · `invalid` (bad payload shape).

Building a timed prototype? Start with [timebox.md](timebox.md) and [quick-start.md](quick-start.md).
Starting a new repository from this template? Follow [template-setup.md](template-setup.md):
it covers making the template private, creating a public assignment repository, what to strip
before it goes public, and recreating the `main` ruleset, which GitHub does not copy.

## Scripts

| Command                | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Dev server with HMR                                                     |
| `npm run build`        | Type-check all projects, then production build to `dist/`               |
| `npm run preview`      | Serve the production build                                              |
| `npm run lint`         | oxlint, including every `jsx-a11y` rule as an error                     |
| `npm run typecheck`    | `tsc -b` across app, tests and e2e projects                             |
| `npm run format`       | Prettier, write                                                         |
| `npm run format:check` | Prettier, verify only                                                   |
| `npm run test`         | Vitest: unit, token contrast, theming contract                          |
| `npm run test:watch`   | Vitest in watch mode                                                    |
| `npm run test:e2e`     | Playwright a11y matrix + keyboard + screen-reader suites (builds first) |
| `npm run test:a11y`    | Unit then browser accessibility suites                                  |
| `npm run verify`       | Everything CI runs except the browser matrix                            |
| `npm run ci:off`       | Park the CI workflow in `ci/` so it does not run (timeboxed builds)     |
| `npm run ci:on`        | Move the CI workflow back to `.github/workflows/`                       |

Running Playwright on a machine whose Chromium predates Playwright's pinned build:
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run test:e2e`.

## Token architecture

```
src/styles/
  material.css       M3 system tokens — the spec. Baseline palette + ALL structure.
  brand.css          Generic placeholder palette, scoped to [data-theme="brand"].
  index.css          Tailwind + @theme inline mapping + type-scale utilities + base styles.
```

**`material.css`** declares every token under its official M3 name (`--md-sys-color-primary`,
`--md-sys-shape-corner-medium`, `--md-sys-elevation-level2`, `--md-sys-typescale-body-large-size`,
`--md-sys-motion-easing-emphasized`, …), so it maps 1:1 to Material Theme Builder exports and any
other M3 tooling. Light and dark values are declared once with `light-dark()`; the active scheme is
the OS preference unless `data-color-scheme="light|dark"` is set on `<html>`.

**Brand files** (`brand*.css`) may set **reference tokens only** — the 49 color roles and the two
`--md-ref-typeface-*` families — inside their own `[data-theme]` scope. M3 draws exactly that line:
`md.ref.*` is brand input, `md.sys.*` is system structure. Shape, elevation, type scale, motion,
state layers and layout therefore stay identical across brands by construction, and the contract
test rejects any brand file that tries otherwise.

A real brand is **generated**: a few brand values (seed colours and typefaces) go into
`scripts/brands/<name>.json`; `npm run brand:derive` expands them into a complete, spec-conformant
scheme using the same HCT tonal-palette engine as Material Theme Builder. Exact
brand hexes are then _pinned_ onto specific roles — the pin list is in the file header — and the
contrast suite proves each pinned pair still clears WCAG AA. Edit the JSON, not the CSS.

**`index.css`** maps tokens onto utilities with `@theme inline`:

| Token namespace           | Utilities                                             |
| ------------------------- | ----------------------------------------------------- |
| `--md-sys-color-*`        | `bg-primary` `text-on-surface` `border-outline` …     |
| `--md-sys-shape-corner-*` | `rounded-xs` `-sm` `-md` `-lg` `-xl` `-full` (4→28px) |
| `--md-sys-elevation-*`    | `shadow-elevation-0` … `shadow-elevation-5`           |
| `--md-sys-typescale-*`    | `type-display-large` … `type-label-small` (15 roles)  |
| Window size classes       | `sm:` 600 · `md:` 840 · `lg:` 1200 · `xl:` 1600       |
| `--md-sys-motion-*`       | `ease-standard` `ease-emphasized-decelerate` …        |

Tailwind's default color, radius, shadow and breakpoint scales are removed. If a value is not an M3
token, it is not available as a utility — on purpose.

### Adding a brand

1. Create `scripts/brands/<name>.json` with the brand's seed colors, typefaces, and any roles to pin
   to exact hexes (copy `example.json` as a template).
2. `npm run brand:derive -- scripts/brands/<name>.json` → writes `src/styles/brand-<name>.css`.
3. Import it in `index.css` after the other brand files.
4. Add `'<name>'` to `THEMES` in `src/lib/theme.ts`. The Playwright matrix picks
   it up automatically.
5. Run `npm run test`. Every brand file is discovered automatically: the contract test rejects any
   token that is not a color role or typeface; the contrast test rejects any role pair below
   WCAG AA. A failing pin means that brand hex cannot be used for that role — move it to a
   container or tint role instead, never weaken the test.

## API layer

Everything that is not a resource schema is built and tested now; resources plug in later.

```
src/api/
  client.ts       request<T>(path, { parse, … }) — the only place the app calls fetch.
                  Timeout, JSON, and every failure normalised to an ApiError.
  errors.ts       ApiError { kind, status, retryable, retryAfterMs } — the retry verdict is
                  decided here, once, from the failure kind and HTTP status.
  retry.ts        Read policy: ≤3 retries, only if retryable, Retry-After honoured,
                  else exponential backoff with full jitter. Writes are never auto-retried.
  queryClient.ts  The policy above installed as TanStack Query defaults.
  health.ts       The reference resource module (schema → keys → queryOptions → hooks).
src/mocks/
  scenario.ts     ok · slow · flaky · down · notfound · invalid — one switch, every handler reads it.
  handlers/       MSW handlers. health.ts covers GET /api/health and POST /api/echo.
  node.ts         The same handlers for Vitest.
  enable.ts       Starts the worker when VITE_API_MOCK=true; dead code (and tree-shaken) otherwise.
src/components/
  Toaster.tsx     Base UI toast viewport, bottom-left, M3 snackbar look.
  AsyncBoundary   Error boundary wired to TanStack's reset, for suspense-style screens.
src/screens/
  ApiHealthToast  One toast updated in place: checking → ok (closes after 6 s) |
                  retrying n/3 → unavailable + Retry (stays). Polite, never takes focus.
```

**What is retried and what is not** — the distinction most apps get wrong:

| Failure                              | Retryable | Why                                                             |
| ------------------------------------ | --------- | --------------------------------------------------------------- |
| Network error, timeout               | yes       | transient by nature                                             |
| HTTP 408, 425, 429, 5xx              | yes       | server or rate-limit trouble; `Retry-After` is honoured         |
| Other 4xx (400, 401, 403, 404, 422…) | no        | the request itself is wrong                                     |
| Response fails schema validation     | no        | the contract is broken; the same request returns the same shape |
| Caller cancelled (abort)             | no        | —                                                               |
| **Any mutation (POST/PUT/DELETE)**   | **no**    | not idempotent; the UI offers an explicit Retry instead         |

Every row is a test in `src/api/*.test.ts` and `src/api/health.test.tsx`, run against the mock
server with instant retries, asserting the exact number of requests made.

Handlers call `applyScenario()` from `src/mocks/applyScenario.ts` first, which implements every scenario once.

Mocking is **network-level**: app code calls `fetch('/api/…')` with no mock branches. In a
production build `VITE_API_MOCK` is unset, so MSW, the handlers and the worker script are
absent from the bundle (verified: zero references in `dist/`).

### Adding a resource

Three files, copied from the `health` example:

1. `src/api/<thing>.ts` — Zod schema (→ inferred type), key factory, `queryOptions`, hooks.
   Reads use `useQuery`; writes use `useMutation` and invalidate by key.
2. `src/mocks/handlers/<thing>.ts` — handlers + seeded data; call `applyScenario()` first so
   the global scenarios work for it too. Register in `handlers/index.ts`.
3. `src/api/<thing>.test.tsx` — the happy path plus whichever policy rows matter for it.

If the backend provides an **OpenAPI spec**, generate the schema/types instead of hand-writing
Zod (`openapi-typescript`); `request()` only needs a `parse` function, so nothing else changes.

## Accessibility: what is verified, and where

The suite is a pyramid. Each layer catches what the one below it cannot.

| Layer       | Runs           | Verifies                                                                                                                                                                                                                                                                                                                                               |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Static**  | editor, commit | `jsx-a11y`: alt text, labels, roles, ARIA validity, keyboard handlers, semantic elements                                                                                                                                                                                                                                                               |
| **Tokens**  | `npm run test` | Every M3 role pair meets WCAG 1.4.3 (4.5:1 text) / 1.4.11 (3:1 non-text) — material and brand, light and dark; brand.css obeys the colors-only contract                                                                                                                                                                                                |
| **Unit**    | `npm run test` | axe (WCAG 2.0/2.1/2.2 A+AA tags) on rendered components; dialog focus trap, Escape, focus return; harness self-test proves violations are detected                                                                                                                                                                                                     |
| **Browser** | `test:e2e`, CI | axe **with color contrast** across 12 projects (theme × scheme × compact/medium/expanded); tab order; visible focus indicator on every stop; pointer focus suppresses ring; focus trap; toast keyboard path (F6, Retry, Escape) and never covering a focused control; `prefers-reduced-motion`; 320px reflow                                           |
| **Reader**  | `test:e2e`, CI | The accessibility tree a screen reader walks: full-page aria snapshot in reading order; landmarks and heading outline; every control's name, role and state (toggles, text field, dialog); decorative icons hidden and alt text meaningful; live-region announcements (one polite toast updated in place); focus after dynamic changes (dialog, Retry) |

Severity policy: any WCAG-tagged violation fails. `best-practice` rules are reported as annotations
and attached as JSON, not enforced.

### The honest ceiling

Automated checks cover roughly **16 of 50 WCAG 2.1 AA criteria** and, by Deque's own audit data,
find about **57% of issues** on typical pages. The screen-reader layer (`e2e/screen-reader.spec.ts`)
pushes past that: it asserts what assistive technology is given rather than what the DOM contains,
so most of what a manual screen-reader pass checks is now a failing test instead of a review note.
This suite therefore guarantees that nothing _automatable_ regresses. It does not certify
conformance.

**What the screen-reader layer automates** (formerly manual):

| Manual check                                 | Now asserted by                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| "Read the page top to bottom; does it flow?" | `toMatchAriaSnapshot` of the whole page: roles, names, states, in reading order  |
| Landmarks and heading outline                | no `banner`, one `main`, one `h1`; heading levels never skip                     |
| Every control has a name, role and state     | `getByRole` + `toHaveAccessibleName` / `aria-pressed` / accessible description … |
| Icon-only buttons say what they do           | "Remove Internal", not "button"                                                  |
| Decorative icons are silent                  | every `<svg>` is `aria-hidden` or named                                          |
| Alt text is meaningful, not a filename       | `alt` is not empty-by-accident, a filename, "image", or "picture of …"           |
| Loading / result is announced                | the **same** toast changes from "Checking API…" to "API ok" in a polite region   |
| Errors are reachable                         | the toast stays with a named Retry; F6 reaches it without walking the page       |
| Focus after dynamic changes                  | dialog close → trigger; Retry → the toast; Escape → the page, never `<body>`     |
| Modal really is modal                        | while a dialog is open, `main` is gone from the tree                             |

**What remains manual**, and should be part of every review:

- Listening to a real screen reader (NVDA, JAWS, VoiceOver, TalkBack): verbosity, pronunciation,
  how a specific reader phrases a role, and reader-specific quirks. The tree is asserted; the
  speech is not. (Guidepup can script real readers, but only on macOS/Windows runners and with
  noticeable flakiness, so it is deliberately not part of the required CI checks.)
- Whether names and descriptions are _good_: "Remove Internal" is verified to exist, not to be
  the clearest possible wording. Same for alt text beyond the obvious anti-patterns.
- Cognitive load, plain-language quality, and whether error recovery makes sense to a person.
- Zoom to 400% with real content, and browser/OS high-contrast modes.
- Any screen or component not yet rendered by `App`: the snapshot covers what the app shows today,
  so extend `expectedTree` in `e2e/screen-reader.spec.ts` when the page gains content.

## Quality gates

```
 edit ──▶ pre-commit ──▶ pre-push ──▶ CI (pull request) ──▶ ruleset on main
          lint-staged     vitest        quality · unit        requires all four
          oxlint+prettier (unit+tokens) build · e2e           checks + a PR
          tsc -b
```

Docs-only pull requests (Markdown anywhere, or anything under `docs/`) run `quality` only;
`unit`, `build` and `e2e` are skipped, which the ruleset counts as passing. Any other file,
pushes to `main` and merge-queue runs get the full suite.

Git hooks are a fast local signal and can be bypassed with `--no-verify`. The branch ruleset
requiring the four CI checks is the enforcement point: nothing merges to `main` without them.

## Project layout

```
src/
  api/             fetch client, ApiError, retry policy, QueryClient, resource modules
  mocks/           MSW scenarios and handlers (dev, Vitest, Playwright)
  components/      Button, Chip (filter/input/assist), TextField, ConfirmDialog, Toaster, AsyncBoundary
  screens/         ApiHealthToast (containers that call hooks live here)
  lib/             cn(), theme helpers, describeError()
  styles/          material.css · brand.css · index.css · parse-tokens.ts (+ token tests)
  test/            Vitest setup, axe config, shared WCAG tag list
e2e/               Playwright fixtures, a11y.spec.ts, keyboard.spec.ts, screen-reader.spec.ts
.github/          CI workflow, PR template, importable main-branch ruleset
docs/              This guide, template setup, quick start, timebox, prompt templates, AI log,
                   architecture example
docs/adr/          ADRs: TEMPLATE.md to copy, 000-ADR-Accessibility.md as the example
CLAUDE.md          Process rules for AI assistants (.cursor/rules points at it)
.github/workflows/ CI
```
