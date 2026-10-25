# Uncertainty signals for AI research output: what to show as badges on source cards

Research note for `research-reviewer`, written 2026-10-25. Scope: an AI answer made of claims, each
claim backed by one or more sources. A reviewer sees each source as a card. This note lists the signals
current practice uses to say how much a claim and its source can be trusted, gives each signal's
allowed values, says how reliably it can be computed, ranks them, and recommends a small set to build.

## What the field measures today

Four strands of current practice feed the list. Links and dates are in the sources section.

1. **Citation checking.** Does the reference exist and match its metadata? Fabricated references are
   the headline failure of LLM research tools. CiteAudit (Feb 2026) frames verification as metadata
   extraction, lookup and retrieval, with a human-validated benchmark; an AAAI 2026 student abstract
   treats detection of hallucinated citations as its own task.
2. **Attribution and support.** Does the cited passage actually support the sentence that cites it?
   The standard is a sentence-level entailment judgement: AIS ("attributable to identified sources",
   Rashkin et al. 2023), ALCE's citation precision and recall (Gao et al. 2023), FActScore's atomic
   facts. The 2026 survey by Schreieder, Schopf and Färber confirms these are still the reused
   frameworks. DeepTRACE (Sept 2025) audited nine live systems: citation accuracy ran from about 40%
   to 79%, and unsupported statements from 12% to 97%; no system met its 90% "acceptable" bar. Elicit's
   own evaluation (Mar 2025) scored each claim's support as fully, partially or not supported.
3. **Evidence quality.** How strong is the source itself? Medicine uses GRADE: high, moderate, low or
   very low certainty, lowered for risk of bias, inconsistency, indirectness, imprecision and
   publication bias. Consumer tools approximate it with study design (meta-analysis, RCT, cohort),
   journal rank and citation counts. Aaron Tay's Nov 2025 review of Consensus warns that journal rank
   and citation count are weak proxies and that LLM-assigned study types can be wrong.
4. **Integrity and status.** Is the source retracted, corrected, or only a preprint? Since Crossref
   took over the Retraction Watch database (Sept 2023) retraction, correction, expression of concern
   and reinstatement records are in the public Crossref API and a daily CSV.

A fifth strand, **model confidence** (verbalized confidence, token probabilities, self-consistency,
semantic entropy), is well studied but the 2025 survey by Shorinwa et al. finds verbalized confidence
clusters at 80 to 100%, that agreement across samples is not factuality, and that RLHF tends to
worsen calibration. It is a weak basis for a badge a reviewer must trust.

## Candidate signals

For each: what it measures, allowed values, how a reviewer reads it, badge idea, and how reliably it
can be computed. Colour roles follow the project rule that each colour has one meaning (green = fine,
red = wrong or rejected, amber = needs attention, neutral = information) and every value in a group
has its own icon and colour.

### 1. Claim support (per source card)

- **Measures:** whether the quoted passage entails the claim text (AIS / ALCE citation NLI).
- **Values:** `supported` | `partial` | `unsupported`. Elicit and ALCE both use this three-step scale.
- **Reviewer reads:** "Does this quote really say what the claim says?" The single most useful
  check, because it is where live tools fail most (DeepTRACE).
- **Badge:** Supported (check-circle, green) / Partly supported (minus-circle, amber) / Not supported
  (x-circle, red).
- **Reliability:** moderate. An NLI model or LLM judge does it automatically; DeepTRACE's judge agreed
  with humans at r = 0.62, so the badge should be presented as the AI's reading, and the quote shown
  so the reviewer can overrule it.

### 2. Reference check (per source card)

- **Measures:** whether the reference resolves to a real work whose title, authors and year match.
- **Values:** `verified` | `mismatch` | `not_found`.
- **Reviewer reads:** "Is this source real?" A `not_found` source makes the claim's support void.
- **Badge:** Verified (badge-check, green) / Details differ (alert-triangle, amber) / Not found
  (file-x, red).
- **Reliability:** high when a DOI or title lookup is possible (Crossref, OpenAlex); the CiteAudit
  pipeline shows metadata extraction plus lookup is the standard recipe.

### 3. Publication status (per source card)

- **Measures:** the work's peer-review and integrity state from registry metadata.
- **Values:** `peer_reviewed` | `preprint` | `corrected` | `concern` | `retracted`.
- **Reviewer reads:** "Has anyone else checked this source, and has it since been pulled?"
- **Badge:** Peer reviewed (shield-check, green) / Preprint (file-clock, neutral outline) / Corrected
  (pencil, amber) / Concern raised (alert-octagon, amber, second shade or icon) / Retracted (ban, red).
  Five values is a lot for one group; `corrected` can be folded into text if space is tight.
- **Reliability:** high for retraction and concern (Crossref `update-to` field, Retraction Watch
  source flag); preprint detection is high where the venue is a preprint server, moderate when a
  preprint later appeared in a journal (PreprintResolver and Pre2Pub exist for exactly that gap).

### 4. Evidence strength (per source card)

- **Measures:** how strong the source's own evidence is, approximated by study design in the GRADE
  spirit rather than full GRADE, which needs a human appraisal.
- **Values:** `strong` | `moderate` | `limited` | `weak`, mapped from design: systematic review or
  meta-analysis = strong; randomised or controlled study = moderate; observational, case or single
  dataset = limited; opinion, commentary, blog or unspecified = weak.
- **Reviewer reads:** "Even if the quote matches, how much weight does this kind of source carry?"
- **Badge:** Strong (signal-high, green) / Moderate (signal-medium, amber) / Limited (signal-low,
  amber darker or orange role) / Weak (signal-zero, neutral grey). Four steps match GRADE's four
  levels, which reviewers in evidence-heavy fields already know.
- **Reliability:** moderate. Design is extracted by an LLM from the abstract; Tay documents that these
  labels can be wrong, so the design word itself should appear on the card as text so the reviewer
  can see what the grade is based on.

### 5. Stance of the source toward the claim (per source card)

- **Measures:** whether the source's finding agrees with the claim's direction, as in scite's
  supporting / contrasting / mentioning citation statements and Consensus's yes / possibly / mixed /
  no meter.
- **Values:** `agrees` | `disagrees` | `neutral`. Avoid "supporting" because it shares a root with
  "supported" in signal 1 and the two mean different things.
- **Reviewer reads:** "Is this source for or against the claim, or does it only mention the topic?"
  A `disagrees` card attached to a claim is the strongest prompt to edit the claim.
- **Badge:** Agrees (thumbs-up, green) / Disagrees (thumbs-down, red) / Neutral (minus, neutral).
- **Reliability:** moderate; same classifier family as signal 1, and scite publishes no public
  accuracy figure. Partly overlaps with signal 1 (an `unsupported` quote often comes from a
  `disagrees` or `neutral` source), which is why it ranks below it.

### 6. Agreement between sources (per claim, not per card)

- **Measures:** share of the claim's sources that agree, in Consensus-meter style.
- **Values:** `consensus` | `mixed` | `contested` | `single_source`.
- **Reviewer reads:** "Do the sources agree with each other?"
- **Badge:** on the claim, not the card; derived from signal 5 during render, so it costs nothing extra.
- **Reliability:** as reliable as signal 5; vote counting ignores study weight (Tay's criticism), so
  it is a hint, not a verdict.

### 7. Recency (per source card)

- **Measures:** publication year and age against a field-specific horizon.
- **Values:** year as text, plus an optional `dated` flag when older than the horizon.
- **Reviewer reads:** "Could this be out of date?"
- **Badge:** none; show the year in the card's meta line, and an amber "Older than N years" word only
  when flagged. A badge for every year would be noise.
- **Reliability:** high (metadata).

### 8. Model confidence (per claim)

- **Measures:** the generator's own certainty via verbalized confidence, token probability or
  self-consistency across samples.
- **Values:** `high` | `medium` | `low`.
- **Reviewer reads:** "How sure was the AI?" But reviewers over-trust it, and the number is usually
  inflated.
- **Badge:** not recommended as a card badge. If shown at all, a claim-level neutral word
  ("AI confidence: low") with the caveat that it is self-reported.
- **Reliability:** low. Verbalized values cluster at 80 to 100%, consistency is not factuality, and
  RLHF worsens calibration (Shorinwa et al. 2025).

### 9. Source prestige (per source card)

- **Measures:** citation count, journal quartile, "rigorous" labels (Consensus via SciScore).
- **Values:** number or quartile.
- **Reviewer reads:** "Is this a respected venue?"
- **Badge:** not recommended. Citation counts vary by field and age; journal rank is a shaky proxy
  for article quality, and both bias toward biomedicine (Tay 2025). Show citation count as text only.
- **Reliability:** high to compute, low in meaning.

## Ranking by usefulness to a reviewer

| Rank | Signal                    | Why                                                                               |
| ---- | ------------------------- | --------------------------------------------------------------------------------- |
| 1    | Claim support             | Where live tools fail most; directly tells the reviewer whether to edit the claim |
| 2    | Reference check           | A fabricated source voids everything else on the card                             |
| 3    | Publication status        | Retractions and concerns are objective, cheap and decisive                        |
| 4    | Evidence strength         | Gives weight to a matching quote; mirrors GRADE, which reviewers know             |
| 5    | Stance                    | Explains an unsupported quote and flags contested claims                          |
| 6    | Agreement between sources | Free once stance exists; claim level only                                         |
| 7    | Recency                   | Metadata text, not a badge                                                        |
| 8    | Model confidence          | Poorly calibrated; show at most as a caveat                                       |
| 9    | Source prestige           | Weak proxy, field-biased; text only                                               |

## Recommended final set

Build badges for signals 1 to 5. Show recency and citation count as plain text in the card's meta
line. Leave model confidence to a single caveat line at the top of the answer ("AI-generated; badges
are the AI's own checks and can be wrong"). Derive agreement between sources per claim from stance if
there is time; it is a sub-flow and can be cut first.

Decisions made without Miriam, open to change: the four-step evidence scale and its design mapping;
folding `corrected` into text if five status values crowd the card; "neutral" rather than
"mentions only" for stance.

## Badge key

Rows in the order a reviewer reads a source card: first "is it real", then "has it been pulled", then
"does the quote match", then "for or against", then "how strong".

| Signal             | Values                                                                                                                                                          | Question it answers                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Reference check    | Verified (badge-check, green) · Details differ (alert-triangle, amber) · Not found (file-x, red)                                                                | Is this source real and correctly cited?                                    |
| Publication status | Peer reviewed (shield-check, green) · Preprint (file-clock, neutral) · Corrected (pencil, amber) · Concern raised (alert-octagon, amber) · Retracted (ban, red) | Has this source been reviewed, and has it since been pulled or changed?     |
| Claim support      | Supported (check-circle, green) · Partly supported (minus-circle, amber) · Not supported (x-circle, red)                                                        | Does the quoted passage say what the claim says?                            |
| Stance             | Agrees (thumbs-up, green) · Disagrees (thumbs-down, red) · Neutral (minus, neutral)                                                                             | Is this source for or against the claim, or does it only mention the topic? |
| Evidence strength  | Strong (signal-high, green) · Moderate (signal-medium, amber) · Limited (signal-low, orange) · Weak (signal-zero, grey)                                         | How much weight does this kind of study carry?                              |

## Sources

- CiteAudit: You Cited It, But Did You Read It? A Benchmark for Verifying Scientific References in
  the LLM Era, arXiv 2602.23452, submitted 26 Feb 2026, v3 1 May 2026. https://arxiv.org/abs/2602.23452
- Detecting Citation Hallucinations in Large Language Model Outputs (student abstract), AAAI 2026.
  https://ojs.aaai.org/index.php/AAAI/article/view/42257
- Schreieder, Schopf, Färber. Attribution, Citation, and Quotation: A Survey of Evidence-based Text
  Generation with LLMs, arXiv 2508.15396, v2 16 Apr 2026 (search done Feb 2025). https://arxiv.org/pdf/2508.15396
- Rashkin et al. Measuring Attribution in Natural Language Generation Models (AIS), Computational
  Linguistics 2023. https://aclanthology.org/2023.cl-4.2.pdf
- Li et al. A Survey of Large Language Models Attribution, arXiv 2311.03731. https://arxiv.org/pdf/2311.03731
- DeepTRACE: Auditing Deep Research AI Systems for Tracking Reliability Across Citations and
  Evidence, arXiv 2509.04499, 2 Sept 2025 (data as of 27 Aug 2025); ICLR 2026 poster.
  https://arxiv.org/pdf/2509.04499
- Elicit. How we evaluated Elicit Reports, 4 Mar 2025. https://elicit.com/blog/elicit-reports-eval
- CDC ACIP GRADE Handbook, chapter 11, communicating the GRADE certainty assessment (four levels).
  https://www.cdc.gov/acip-grade-handbook/hcp/chapter-11-communicating-findings-from-the-grade-certainty-assessment/index.html
- OCEBM 2011 Levels of Evidence (code system). https://fhir.awmf.org/awmf.ig/CodeSystem-cs-ocebm-2011-levels-of-evidence.html
- Aaron Tay. A 2025 Deep Dive of Consensus: Promises and Pitfalls in AI-Powered Academic Search,
  15 Nov 2025. https://aarontay.substack.com/p/a-2025-deep-dive-of-consensus-promises
- Purdue Libraries guide to scite Smart Citations (supporting, mentioning, contrasting), updated
  17 Mar 2026. https://guides.lib.purdue.edu/scite
- Crossref. Retraction Watch data in the Crossref API (retraction, correction, expression of concern,
  reinstatement). https://www.crossref.org/documentation/retrieve-metadata/retraction-watch/ and
  https://www.crossref.org/blog/retraction-watch-retractions-now-in-the-crossref-api/
- PreprintResolver: resolving published versions of arXiv preprints, arXiv 2309.01373.
  https://arxiv.org/abs/2309.01373v1
- Shorinwa et al. A Survey on Uncertainty Quantification of Large Language Models, arXiv 2412.05563,
  v2 1 Jul 2025. https://arxiv.org/pdf/2412.05563
- Geng et al. A Survey of Confidence Estimation and Calibration in Large Language Models, arXiv
  2311.08298. https://alphaxiv.org/abs/2311.08298
