# Architecture Decision Records

This directory is the entry point for the project's Architecture Decision Records (ADRs).

Decision files are stored alongside the architecture documentation in [`docs/architecture/adr/`](../architecture/adr/README.md). This document captures the operating policy that applies wherever ADRs are written.

## 1. Purpose

An ADR is a short, dated record of an architecturally significant decision. ADRs exist to:

- preserve the reasoning behind a decision so future contributors can act on the same context;
- make trade-offs explicit and reviewable;
- ensure AI contributors can locate the binding decision instead of reinventing it.

## 2. When an ADR Is Required

Open an ADR when any of the following is true:

- A runtime, framework, language, or major library is being introduced, removed, or replaced.
- A contract format (API, event, AI agent) is being adopted or changed in a breaking way.
- A repository structure or governance rule is being modified beyond a routine update.
- A new external system, secret, or shared piece of infrastructure is being introduced.
- Two reasonable approaches were considered and the chosen path is non-obvious.

For day-to-day code, refactoring within an existing module, or documentation fixes, an ADR is not required.

## 3. Naming Convention

```
docs/architecture/adr/ADR-<NNNN>-<kebab-case-title>.md
```

- `<NNNN>` is a zero-padded sequential number (`0001`, `0002`, ...).
- Titles are concise, action-oriented, and stable once accepted.
- Status values: `Proposed`, `Accepted`, `Superseded`. Add `Superseded by ADR-XXXX` when applicable.

## 4. Template

```text
# ADR-<NNNN>: <Title>

## Status

Proposed | Accepted | Superseded

## Context

What problem, constraint, or opportunity motivated this decision.

## Decision

The decision in clear, declarative language.

## Consequences

Trade-offs, follow-up work, and known risks.
```

## 5. Approval Workflow

1. Open an issue describing the architectural question and link the draft ADR to it.
2. Add the ADR file with status `Proposed`.
3. Request human review. AI contributors may draft the ADR but cannot accept it.
4. After approval, update the ADR status to `Accepted` in the same pull request that closes the issue.
5. Update [`docs/architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) and any affected contracts in the same change set.

## 6. Architectural Traceability

- Each accepted ADR should reference the issue that triggered it.
- Each architecturally significant change in code should reference the ADR that justifies it (commit message, pull request description, or inline pointer).
- Superseded ADRs are kept for history. Do not delete them.

## TODO

- Add ADR-0001 covering runtime stack selection.
- Add ADR-0002 covering the contracts-first workflow.
- Add an index that lists all accepted ADRs once more than three exist.
