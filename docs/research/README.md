# Research

Independent exploratory research artifacts for the portal. Research lives in this directory while it is still exploratory; once a research output is acted on, it graduates into an ADR, a contract, a feature backlog item, or a published artifact in the educational repository.

## 1. Purpose

- Provide a safe space for exploratory work that does not yet justify an architectural decision.
- Make exploratory thinking traceable: assumptions, options, and conclusions are written down.
- Reduce duplicated investigation: future contributors can rediscover prior research instead of repeating it.

## 2. Research vs ADR

| Aspect | Research | ADR |
| --- | --- | --- |
| Purpose | Explore an open question. | Record an accepted decision. |
| Outcome | Findings, hypotheses, recommendations. | A single, durable decision. |
| Authority | Informational. | Binding once accepted. |
| Lifecycle | May be archived, extended, or superseded freely. | Versioned and superseded only via a new ADR. |
| Audience | Contributors evaluating options. | Anyone implementing or reviewing the system. |

A research note that crystallizes into a decision is replaced by an ADR; the research note may be linked from the ADR for context.

## 3. Exploratory Philosophy

- **Unconstrained.** Research may consider options that are out of scope for the current roadmap; it must clearly mark them as such.
- **Honest.** Negative results, dead ends, and disproven assumptions are valuable and must be recorded.
- **Bounded effort.** Each note declares a time or scope budget; exceeding it triggers a checkpoint with a human reviewer.
- **Reproducible.** Sources, queries, and prompts used during research are listed so the investigation can be repeated.

## 4. Conventions

- Files use the [template](template.md) and the naming pattern:

  ```
  docs/research/<YYYY-MM-DD>-<kebab-case-topic>.md
  ```

- Each note declares an owner and a status: `Active`, `Archived`, or `Superseded by <link>`.
- Research notes are append-only once archived. Corrections are added as updates with a date.

## 5. AI-Assisted Research

- AI contributors may produce research drafts using prompts under `prompts/architecture/`.
- AI-generated research must be reviewed by a human before being committed; raw model output is not accepted as a final artifact.
- AI executions referenced by a research note must include their prompt version and execution identifier.

## 6. Educational Sync

- Research that graduates into a publishable artifact is moved to the educational repository following the [Educational Sync Policy](../governance/EDUCATIONAL_SYNC_POLICY.md).
- Sensitive research (security, partner-related, unpublished roadmap) never leaves this repository.

## TODO

- Add an index of active research notes once more than three exist.
- Add a research-to-ADR promotion checklist.
- Add a research-to-education export checklist.
