# Repository Rules

Operational rules for the `open-ai.ru` repository. These rules complement [`AI_RULES.md`](AI_RULES.md), the issue templates, and the pull request template.

## 1. Repository Purpose

The repository is the production foundation for the AI-assisted portal platform. It hosts:

- governance documents and contracts;
- architecture, product, and operational documentation;
- feature, contract, and infrastructure code as it is introduced;
- automation, validation, and review tooling.

It is not a tutorial, course, or research workspace. Educational materials belong in [`research-and-edu-ai-lab`](https://github.com/G-Ivan-A/research-and-edu-ai-lab) — see [`EDUCATIONAL_SYNC_POLICY.md`](EDUCATIONAL_SYNC_POLICY.md).

## 2. Standards

- **Language.** Repository defaults to Russian for product- and AI-facing governance. Engineering documents, code identifiers, and tests default to English. Mixed sections are acceptable when they preserve clarity.
- **File naming.** Lowercase with hyphens for source files, `SCREAMING_SNAKE_CASE.md` for top-level governance documents, kebab-case for nested documentation.
- **Encoding.** UTF-8 with LF line endings. Enforced via `.editorconfig` and `.gitattributes`.
- **Formatting.** Two-space indentation by default. Markdown files keep trailing whitespace only where line breaks are intentional.

## 3. Artifact Expectations

Each merged change must leave the repository in one of three states:

1. **Documentation-only.** A documentation update with no code impact.
2. **Contract or scaffold update.** A change inside `contracts/`, `docs/`, `prompts/`, or top-level `*.md` files with no runtime side effects.
3. **Implementation.** Code in `features/`, `services/`, `lib/`, `app/`, etc., backed by tests and updated documentation when applicable.

A change that mixes implementation and major governance updates should be split into multiple pull requests when possible.

## 4. Governance Principles

- **Governance before scale.** Rules, contracts, and ADRs are written before the code they govern.
- **Traceability.** Every change is linked to an issue and, when architecturally significant, to an ADR.
- **Reversibility.** Prefer additive, reversible changes. Removals require explicit approval in the issue.
- **Human review.** Mandatory for governance, architecture, security, and contract changes. Optional but encouraged otherwise.

## 5. Documentation Philosophy

- Treat documentation as a product. Each document has an owner, an audience, and a maintenance trigger.
- Prefer short, factual baselines that grow with the system over speculative long-form documents.
- Place documents close to their domain:
  - Governance under `docs/governance/`.
  - Architecture under `docs/architecture/` (decisions in `docs/architecture/adr/`, narratives in this directory).
  - Product under `docs/product/`.
  - Development standards under `docs/development/`.
  - Testing under `docs/testing/`.
  - Releases under `docs/releases/`.
  - Research under `docs/research/`.

## 6. Maintainability Requirements

- Every directory should have a `README.md` or equivalent index when it contains more than placeholder content.
- Markdown documents should declare an owner and a TODO list when the content is still evolving.
- Code modules should expose their public surface through `index.ts` (or equivalent) once a stack is selected. Until then, scaffolding placeholders remain via `.gitkeep`.

## 7. Validation and CI

- `tests/validate-repository-structure.sh` enforces the approved skeleton on every pull request.
- `tests/validate-issue-templates.sh` keeps the issue templates aligned with the contract.
- Future automation must extend these scripts rather than replace them, unless an ADR approves the replacement.

## 8. Change Management

- Open an issue using the matching template (`foundation`, `feature`, `ai_implementation_task`).
- Work on a single branch named after the issue (`issue-<number>-<slug>`).
- Update [`CHANGELOG.md`](../../CHANGELOG.md) when a change is user-visible, governance-relevant, or release-blocking.
- Merge through pull requests only. Direct pushes to `main` are not allowed.

## TODO

- Add release cadence rules once the runtime stack is selected.
- Add an explicit security incident response procedure.
- Define ownership matrix for feature boundaries.
