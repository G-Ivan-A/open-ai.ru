# Document Update Policy

This policy defines when project documentation must be updated during AI-assisted and human-led changes.

## When Documentation Must Change

Update related documentation when a pull request changes:

- Governance rules, contributor workflows, or review gates.
- Repository structure, required files, or validation scripts.
- Architecture decisions, domain model boundaries, or contracts.
- Product scope, roadmap, or user-facing behavior.
- Testing strategy, release process, or operational procedures.

## Required Review Steps

For documentation-impacting changes:

1. Identify related documents before implementation.
2. Update the closest authoritative document instead of duplicating guidance.
3. Add cross-links when a new document becomes part of the governance or delivery workflow.
4. Include documentation updates in the pull request summary.
5. Mark the documentation checklist in the pull request template.

## Ownership

- Owner: Project lead.
- Reviewers: Human maintainers.
- Review trigger: Any pull request that changes governance, architecture, contracts, contributor workflows, or validation rules.

## Related Documents

- [`AI_GOVERNANCE.md`](../../AI_GOVERNANCE.md)
- [`AI_RULES.md`](../../AI_RULES.md)
- [`docs/governance/AI_RULES.md`](AI_RULES.md)
- [`docs/governance/REPOSITORY_RULES.md`](REPOSITORY_RULES.md)
