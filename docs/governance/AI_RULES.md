# AI Rules

Operational contract for AI contributors (Codex, Cursor, Claude, Qwen, and future agents) working in this repository.

This document supplements [`AI_GOVERNANCE.md`](../../AI_GOVERNANCE.md) and [`AI_QUICK_REF.md`](../../AI_QUICK_REF.md). Where any document conflicts with an open issue, the issue's `Operating Mode`, `Constraints`, and `Allowed / Forbidden Changes` win.

---

## 1. Operating Boundaries

AI agents may operate in two modes, always explicitly named in the issue:

- **Structured Mode** — execute the issue as written. Do not introduce architectural, structural, or stylistic changes that are not requested.
- **Creative Mode** — propose improvements within the stated `Allowed Changes`. Justify proposals. Never bypass `Forbidden Changes`.

When the operating mode is unclear, default to Structured Mode and ask for clarification.

## 2. Allowed Behaviors

- Implementing the functional and non-functional requirements listed in the issue.
- Reusing existing modules, contracts, prompts, and patterns.
- Adding tests, fixtures, and validation for the requested change.
- Proposing improvements via comments — never via silent commits.
- Asking clarifying questions when context, contracts, or acceptance criteria are ambiguous.
- Emitting concise, well-named code with minimal comments.

## 3. Forbidden Behaviors

- Restructuring the repository (renaming, moving, or deleting existing directories or files) without an explicit instruction in the issue.
- Introducing new dependencies, runtimes, or infrastructure without an approved ADR.
- Generating business logic, copy, or product flows that are not described in the issue.
- Bypassing tests, validators, or hooks.
- Committing secrets, credentials, or environment values to the repository.
- Producing speculative scaffolding for future requirements.

## 4. Implementation Expectations

- **Token discipline.** Read only what the task requires. Use the document priority table in `AI_GOVERNANCE.md` to scope reading.
- **Reproducibility.** Every meaningful change should be traceable through commits, issues, ADRs, or contract updates.
- **Determinism.** Prefer deterministic outputs. Mark non-deterministic AI behavior in comments or test fixtures so reviewers can identify it.
- **Reuse before invention.** Search `features/`, `lib/`, `services/`, `components/`, and `contracts/` before writing new abstractions.
- **Small, focused commits.** Keep commits self-contained so they can be reverted independently.

## 5. Architecture Protection

- Architecture decisions are recorded in [`docs/architecture/adr/`](../architecture/adr/README.md). Do not change runtime stacks, contract formats, or feature boundaries without a new accepted ADR.
- Treat `contracts/` as immutable until a contract revision is requested in writing. Breaking changes require a contract version bump and an ADR.
- Feature boundaries in `features/` are owned by the issue that introduced them. Cross-feature edits require explicit issue scope.

## 6. Escalation Protocol

Stop and request human review when any of the following is true:

- Requirements contradict an existing contract, ADR, or governance document.
- An architectural decision is required and no ADR covers it.
- A new dependency, secret, or external integration is required.
- Acceptance criteria are ambiguous, incomplete, or untestable.
- The agent is about to delete or rename existing artifacts.

When escalating, comment on the issue or pull request with the question, list one or two viable options, and wait for a human decision.

## 7. Self-Review Before Pull Request

Before requesting human review, the AI contributor must confirm:

- The pull request is linked to a single issue and addresses only its scope.
- The issue's `Acceptance Criteria` are individually checked.
- `tests/validate-repository-structure.sh` (and any feature-specific tests) passes locally.
- New documentation is consistent with [`docs/governance/REPOSITORY_RULES.md`](REPOSITORY_RULES.md).
- No forbidden changes have been introduced.

## 8. Document Ownership

- Owner: Project lead.
- Reviewers: Human maintainers.
- Update cadence: Reviewed each time `AI_GOVERNANCE.md` or contributor workflows change.

## TODO

- Add per-agent annexes if individual AI tools require dedicated guardrails.
- Add automated lint rules that enforce a subset of these constraints.
