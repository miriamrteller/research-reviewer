# Quick start: a prototype in one hour

For a timed build on this template. Everything here was run end to end on a fresh clone: install,
lint, the unit tests, the build and the browser tests all pass. Adding a new screen with a mocked,
slow, failing and retrying endpoint took about five minutes.

## Minute 0: set up

```bash
npm ci
npm run dev                       # http://localhost:5173, mock API already on
```

Force any API behaviour from the URL: `?mock=ok|slow|flaky|down|notfound|invalid`.
`slow` takes 2 s by default; add `&delay=5000` for longer (max 30 s). `flaky` fails twice, then
recovers, so you can watch the retry counter. `down` returns 503 with Retry-After.

Local browser tests need a Chromium. If `npx playwright install` is not possible, point at one:
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run test:e2e`.

## Add a screen in five steps

Copy the shape of `src/api/health.ts` and `src/mocks/handlers/health.ts`.

1. **Schema and hook**, `src/api/things.ts`: Zod schema, key factory, `queryOptions`, `useThings()`.
2. **Mock handler**, `src/mocks/handlers/things.ts`. Call the shared helper first so every
   scenario works for free:

   ```ts
   import { http, HttpResponse } from 'msw'
   import { applyScenario } from '../applyScenario'

   export const thingHandlers = [
     http.get('/api/things', async () => {
       const override = await applyScenario('GET /api/things')
       if (override) return override
       return HttpResponse.json(seed)
     }),
   ]
   ```

   Register it in `src/mocks/handlers/index.ts`.

3. **Component** with the three states. Loading is a skeleton inside an `<output aria-label>`
   (polite live region, decorative bars `aria-hidden`). Error is `role="alert"` with a Retry
   button that calls `refetch()`. Success renders the data. `AsyncBoundary` does the same for
   suspense queries.
4. **Unit test** in `src/api/things.test.tsx`: use `renderWithProviders`, `setScenario('down')`,
   and `axe` from `src/test/axe`. Retries are instant in tests. `requestLog` counts requests.
5. **Browser scans**: add your states to `e2e/a11y.spec.ts` (`/?mock=slow&delay=4000`, `/?mock=down`).
   They run across every theme, scheme and window size.

## What is automatic, what is not

- **Automatic**: lint with jsx-a11y; axe in jsdom; axe with real contrast in Chromium for all
  themes and sizes; keyboard, focus and screen-reader tree tests for the existing page; retry
  policy (reads retry up to 3 times, writes never); CI gates on main.
- **Not automatic**: a new screen is only scanned in the states you add scans for. The
  screen-reader snapshot of the page at rest is a partial match, so new content does not fail it
  but is also not asserted. Extend `expectedTree` in `e2e/screen-reader.spec.ts` if you want that.
- **Not covered**: real screen reader speech, 400% zoom, content quality. See `docs/template-guide.md`.

## Pitfalls found while testing

- The API health is a toast in a region named "Notifications", not a top bar. The e2e tests scope
  its locators to that region, so your screen can have its own status, alert and Retry in `main`.
  Scope any new locators to `main` the same way, or Playwright fails with a strict mode violation.
- `npm run test:e2e` builds first and takes about three minutes for the full matrix. While
  iterating, run one project: `npx playwright test --project="a11y · material · light · expanded"`.
- The build prints a chunk size warning (about 545 kB). It does not fail the build.
- In the template, main only accepts changes through a PR with the four CI checks green. A timeboxed
  repo has no ruleset, so CI never blocks a merge there; the local checks are the gate. `npm run ci:off`
  stops CI from running there at all.
- `npm run verify` is the fast pre-push check (no browser tests).

## Suggested hour

| Minutes  | Do                                                               |
| -------- | ---------------------------------------------------------------- |
| 0 to 5   | Clone, `npm ci`, `npm run dev`, read this page                   |
| 5 to 15  | Resource module, mock handler with realistic seed data           |
| 15 to 35 | Main screen: list, detail, loading skeleton, error and Retry     |
| 35 to 45 | Unit tests for the states, one axe scan per state                |
| 45 to 55 | `npm run verify`, then `npm run test:e2e`, fix what it finds     |
| 55 to 60 | ADR in `docs/`, architecture diagram, README update, open the PR |
