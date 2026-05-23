# AI Governance

This document defines the baseline rules for AI-assisted development in the open-ai.ru repository.

## Purpose

- Keep AI-generated changes reviewable, traceable, and reproducible.
- Separate structured governance work from exploratory or creative work.
- Require explicit contracts and decisions before implementation details spread across the codebase.

## Operating Modes

### Structured Mode

Use Structured Mode for repository structure, governance files, contracts, CI, security-sensitive code, data models, public APIs, and release workflows.

Required behavior:

- Follow existing repository structure.
- Prefer small, auditable changes.
- Add validation for structural or behavioral requirements.
- Record architecture decisions in `docs/architecture/adr/`.

### Creative Mode

Use Creative Mode for product exploration, UX proposals, prompt experiments, and architecture options.

Required behavior:

- Mark assumptions explicitly.
- Keep experimental work isolated until accepted.
- Convert accepted ideas into Structured Mode tasks before production implementation.

## AI Agent Workflow

1. Read the linked issue and relevant comments.
2. Identify the smallest complete change that satisfies the acceptance criteria.
3. Add or update tests before finalizing the change.
4. Preserve traceability through commits, PR description, and ADRs when needed.
5. Request human review for governance, product, security, or architectural changes.

## Review Requirements

- Human review is required before merging foundation, governance, release, security, or architecture changes.
- AI agents must not remove previously accepted product behavior without an explicit issue requirement.
- PRs must describe validation performed and remaining risks.

## TODO

- Define security and privacy review gates.
- Add prompt review rules for production AI workflows.
- Define ownership for contracts and ADR approval.
