# Research Review

A React prototype for the human-in-the-loop workflow that checks AI research claims against reliable sources.

## Setup

```bash
npm install          # also installs git hooks via husky
npm run dev          # http://localhost:5173
npm run verify       # runs all tests: unit, e2e, a11y see more below in Options
```

## Short description and target user

AI gives confident answers and cites sources, but those sources can be wrong, and the conclusions drawn from them can be wrong. Unless a person checks, that confidence goes untested. An AI system cannot be trusted to rate its own correctness, so a human has to take responsibility.

This prototype is that check. It is a straightforward workflow for the oversight task: the key information is on the screen, and distractions are kept out of the way. The reviewer can edit the research quote, approve it, or send it back for revision.

The user is a scientific researcher, qualified to understand the text and the sources, and to judge the consequences of approving, editing, or sending a claim back.

## Assumptions

- This prototype has no authentication or authorisation.
- The reviewer is qualified to edit the text and is trusted to check the sources, so an edited claim is marked "Edited" without a warning that its sources were not re-checked.
- The workspace is used by one person, in one tab.
- Everything shown here is fictitious, and nothing is encrypted.
- Confidence markers are assumed correct. The reviewer has learned what they mean.
- There is no audit trail.
- There is no edit history.
- There is no real backend.
- The question is not editable. Asking for a revision starts a new flow, with new text and new sources: a new workspace.
- Source information is provided in full as plain text, and an external link opens the original.
- The badges (groups, values, icons and colours in [ADR 001](docs/adr/001-ADR-Source-badges.md)) are a prototype stand-in. A real product would likely already have its own badges and colour tokens, and its own definition of each signal, and would use those instead.

## Intended user journey

- The reviewer opens the workspace and sees the original question, the AI research claims, and the source material, with confidence markers visible.
- They read the claims and the attached sources, and assess their confidence.
- They may edit the text.
- They approve the claim. It is marked approved and becomes read-only.
- Or they send the whole claim back for revision, with a reason. That also makes it read-only.
- A "Feedback" button in the bottom-right corner opens a short dialog for feedback on the review workspace itself. It never blocks or changes the review.
- we've added a concise badge key incase for extra clarity for the reviewer.

## Accessibility and design choices

This prototype is built ontop of my own template made with [Base UI](https://base-ui.com/), for unstyled accessible components. `src/styles/material.css` supplies the spacing, size, elevation, and other values from the [Material Design 3](https://m3.material.io/) specification, so the components start from an accessible and spec following baseline.

On top of that is a brand token layer, ready for tailwind. Customisation is typeface and colour. Colours go through an accessibility contrast check, and they are generated with Material's own HCT recommendation. Shape, elevation, type scale, and layout stay on the Material defaults, so a design change does not break those rules, and the brand can change on its own.

Accessibility tests can be run in the pipeline, so each change is checked before it lands. These are not done for the prototype.

## How the design supports human oversight

### AI output

The AI-generated text is clearly displayed, with the sources for each conclusion marked alongside it. This block is the centre of the screen, because it is the focus of the review. The passage is kept short, so attention holds. A note reminds the reviewer that the text is AI-generated and needs a human review. Focusing on each claim highlights the relevant source to check, minimising confusion.

### Evidence review

Every source the AI used is on the page, so the reviewer can read the precise passage and the background the claim depends on. The full document is in the workspace, with the relevant section highlighted, so the review does not mean changing screens. A link opens the original in another tab when more context, or the document at full size, is needed.

Each claim's sources sit beside it in one Sources panel on the right: a bar per source with its badges, title and quote. Hovering or focusing a claim's bar highlights the claim, and the other way round. Opening a bar fills the panel with the whole document, scrolled to the highlighted passage. On a narrow screen or at high zoom, each claim's sources sit under it.

### Uncertainty

This was the main research topic. Each source card shows five badge groups, one value each, in the order a reviewer reads a card. Every value has its own icon, colour and word.

| Badge group        | Values                                                |
| ------------------ | ----------------------------------------------------- |
| Reference check    | Verified · Details differ · Not found                 |
| Publication status | Peer reviewed · Preprint · Concern raised · Retracted |
| Claim support      | Supported · Partly supported · Not supported          |
| Stance             | Agrees · Disagrees · Neutral                          |
| Evidence strength  | Strong · Moderate · Limited · Weak                    |

The badges are prototype stand-ins: in this mock every value is fixture data, where a real system would need a reference lookup, a retraction feed and an entailment check. Model confidence is not a badge, because it is poorly calibrated and reviewers over-trust it; instead one caveat line at the top of the answer says the badges are the AI's own checks and can be wrong. The AI's wording of each claim carries its support judgement, and editing a claim does not re-check it against its sources. The full decision is in [ADR 001](docs/adr/001-ADR-Source-badges.md), and the research behind it is in [uncertainty-signals.md](docs/research/uncertainty-signals.md).

### Feedback

- A workspace in review looks different from one that has been approved and is now read-only. The edit area shows when edits are unsaved. API errors are shown clearly with a toast and if apropriate a retry button.
- A "Feedback" button in the bottom-right corner opens a short dialog for anything the reviewer found difficult or missing: a 1 to 5 ease rating, a topic, and a comment. Each submission records who sent it and when. The button stays low emphasis so it does not compete with Approve, and the page keeps enough space below its content that the button never covers a focused control. Below 600px it sits at the end of the page instead.

### Error recovery

The mock API produces a clear error state, and errors are written so the reviewer knows what happened. Saved, versioned edits would help here; they are skipped for this prototype.

## Technical and UX tradeoffs

- No real API, authentication, or authorisation.
- Branding is only a skeleton.
- For this timebox, laptops and tablets come first. Phones neeed a separate design pass, (or possibly to be used horizontally).
- Accessibility comes first, so extra animation, hover effects. Tooltips are left out.
- No app-wide client state for this single-page version. TanStack Query holds server state; interaction state stays in the component.
- Merges are not gated on CI for this prototype. (quality, unit, build, e2e). otherwise, each change waits a few minutes for the checks, which costs time in a timebox. In real work that wait is worth it to keep the code clean.

## How to mature this prototype for enterprise

- An audit trail, with saved versions and an author on each one.
- Control over the badges.
- A visible record of which sources have been opened and which have not.
- Per-claim and per-source feedback flags, and a triage view for the team that reads the feedback.
- Authentication with silent refresh, and saved progress.
- Authorisation with roles: some read-only, some with limited access, for example revise but not approve.
- Encryption of data sent.
- A custom design theme.

## How AI was used in this project

I directed the whole build and AI threads wrote the code, working in parallel PRs from my own layout sketch and my ADR 001. I supplied the research questions, seed content and design feedback, decided what to cut when time ran short, and corrected the AI whenever it drifted. Every PR was merged only on my explicit yes and an input was added to the ai-log. The template and diagrams were prepared before the clock and one touch-up PR was added just afterwards.

## Options

The following are settings from the template that can be added to the URL to veiw differernt states.
Set a theme and colour scheme with `/?theme=brand&scheme=dark`; the page has no switcher. Themes: `material` (Material 3 baseline), `brand` (generic placeholder). There is no top bar: the API's health shows as a toast in the bottom-left corner (Material 3 snackbar, Base UI Toast). "API ok" closes itself after 6 seconds, paused while the pointer or keyboard focus is on it; "API unavailable" stays with Retry until it is used or dismissed. F6 jumps to it.

In development the app talks to a mock API (MSW). Drive it from the URL with `?mock=<scenario>`:

| Scenario   | Behaviour                                      |
| ---------- | ---------------------------------------------- |
| `ok`       | Succeeds                                       |
| `slow`     | 2 s latency, or set `&delay=<ms>`              |
| `flaky`    | Fails twice, then recovers (watch the retries) |
| `down`     | 503 with `Retry-After`                         |
| `notfound` | 404                                            |
| `invalid`  | Payload fails schema validation                |

## Scripts

| Command                | What it does                                                                |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Dev server with HMR                                                         |
| `npm run build`        | Type-check all projects, then production build to `dist/`                   |
| `npm run preview`      | Serve the production build                                                  |
| `npm run lint`         | oxlint, with the configured `jsx-a11y` rules as errors                      |
| `npm run typecheck`    | `tsc -b` across the app, unit-test, and e2e projects                        |
| `npm run format`       | Prettier, write                                                             |
| `npm run format:check` | Prettier, check only                                                        |
| `npm run test`         | Vitest: unit tests, token contrast, and the theming contract                |
| `npm run test:watch`   | Vitest in watch mode                                                        |
| `npm run test:e2e`     | Playwright accessibility, keyboard, and screen-reader suites (builds first) |
| `npm run test:a11y`    | Unit tests, then the browser accessibility suites                           |
| `npm run verify`       | Everything CI runs, except the browser matrix                               |

On a machine whose Chromium is older than Playwright's pinned build:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run test:e2e
```
