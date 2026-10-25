# <App name>

<One sentence: what it is and who it is for.>

## The user and the journey

<Who the user is and what they must get done.>

1. <Sees …>
2. <Opens …>
3. <Confirms …>

## Assumptions

- <Each ambiguity in the brief, read the most literal way.>

## In scope, out of scope

- In: <…>
- Out: <…>

## Design decisions

<Two or three lines, linking `docs/research.md` (written on the clock), `docs/adr/` and `docs/architecture.md`.>

## How the design supports the user

<A few lines, written after the first screenshot.>

## With more time

- <…>

## How AI was used

<Four lines from `docs/ai-log.md`: research, ADRs, code, what was changed or rejected.>

## Prepared beforehand

This repository started from a private, brand-neutral template prepared before the brief was
read: the stack, design tokens, mock API, CI and accessibility tests
([template guide](docs/template-guide.md)), the AI rules in `CLAUDE.md`, the
[prompt templates](docs/prompts/README.md), the [timebox routine](docs/timebox.md) and the
example [accessibility ADR](docs/adr/000-ADR-Accessibility.md). Nothing in it is specific to this
brief.

## Trade-offs

<…>

## Getting started

```bash
npm ci
npm run dev          # http://localhost:5173, mock API on
npm run verify       # lint, format, typecheck, unit tests, build
CI=1 npm run test:e2e
```

Mock API scenarios from the URL: `?mock=ok|slow|flaky|down|notfound|invalid`, plus `&delay=<ms>`
for `slow`. Theme and scheme: `?theme=brand&scheme=dark`.
