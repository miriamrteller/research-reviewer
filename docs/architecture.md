# Architecture

These diagrams are the target the build works toward. Each later PR (screen, inspect, edit,
feedback) updates this file in the same PR if what it builds differs.

## High Level

```mermaid
%%{init: {"flowchart": {"wrappingWidth": 400}}}%%
flowchart LR
  subgraph UI["1 · Screen (React)"]
    direction TB
    Screen["<b>Review screen</b><br/>claims · sources · Edit · Approve · Revise"]
    Look["Base UI controls · M3 tokens + Tailwind"]
    Look -.-> Screen
  end
  subgraph Data["2 · Server data (TanStack Query)"]
    direction TB
    Read["<b>Read</b> the document<br/>retried up to 3 times"]
    Write["<b>Approve / Revise</b><br/>never retried"]
  end
  Req["<b>3 · request()</b><br/>the only fetch<br/>Zod checks every reply"]
  MSW["<b>4 · Mock API (MSW)</b><br/>GET review-document<br/>POST approve · POST revise"]

  Screen --> Read & Write
  Read & Write --> Req --> MSW
```

## Approve Revise

```mermaid
sequenceDiagram
  actor R as Reviewer
  participant S as Review screen
  participant M as Mock API

  alt Approve
    R->>S: Approve, tick "I confirm", optional note
    S->>M: POST approve (claims, note)
  else Revise
    R->>S: Revise, type a reason (required)
    S->>M: POST revise (reason)
  end
  alt success
    M-->>S: decided document with by and at
    S-->>R: read-only: green tick Approved or red lock Revision needed, by · at
  else error
    M-->>S: error
    S-->>R: dialog stays open, try again
  end
```

## Sources

```mermaid
stateDiagram-v2
  direction LR
  state "Claim with its source cards" as Rest
  state "Claim and its cards highlighted" as Linked
  state "Source open at the quoted passage" as Open
  state "Source unavailable<br/>quoted passages still shown" as Unavailable

  [*] --> Rest
  Rest --> Linked: hover or Tab
  Linked --> Rest: move away
  Linked --> Open: click or Enter
  Linked --> Unavailable: click or Enter<br/>(no full text)
  Open --> Linked: Close or Escape
  Unavailable --> Linked: Close or Escape

  classDef open fill:#e8f0fb,stroke:#2f5d8a,color:#1b1b1b
  classDef bad fill:#fdeeee,stroke:#c62828,color:#1b1b1b
  class Open open
  class Unavailable bad
```
